import express from 'express'
import cors from 'cors'
import pg from 'pg'

const { Pool } = pg
const app = express()
const port = Number(process.env.PORT) || 10000
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')
    ? { rejectUnauthorized: false }
    : false,
})

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(value => value.trim()) : true }))
app.use(express.json({ limit: '32kb' }))

const menuInitial = [
  { id: 'burger-classic', nom: 'Burger Classic', description: 'Steak grillé, cheddar fondant, salade croquante et sauce maison.', prix: 3500, categorie: 'Burgers', emoji: '🍔', disponible: true },
  { id: 'poulet-frites', nom: 'Poulet & frites', description: 'Poulet doré et frites croustillantes, préparés à la commande.', prix: 4000, categorie: 'Menus', emoji: '🍗', disponible: true },
  { id: 'tacos-viande', nom: 'Tacos viande', description: 'Tortilla généreuse, viande épicée, fromage et sauce crémeuse.', prix: 3000, categorie: 'Tacos', emoji: '🌮', disponible: true },
  { id: 'frites', nom: 'Frites maison', description: 'Une portion de frites bien dorées à partager… ou pas.', prix: 1200, categorie: 'Accompagnements', emoji: '🍟', disponible: true },
  { id: 'jus-bissap', nom: 'Bissap frais', description: 'Boisson locale fraîche, légèrement acidulée.', prix: 800, categorie: 'Boissons', emoji: '🥤', disponible: true },
  { id: 'nuggets', nom: 'Nuggets croustillants', description: 'Bouchées de poulet panées, avec une sauce au choix.', prix: 2200, categorie: 'Accompagnements', emoji: '🍗', disponible: true },
]

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      nom VARCHAR(120) NOT NULL,
      description VARCHAR(500) NOT NULL DEFAULT '',
      prix INTEGER NOT NULL CHECK (prix >= 0),
      categorie VARCHAR(80) NOT NULL DEFAULT 'Nos plats',
      emoji VARCHAR(16) NOT NULL DEFAULT '🍽️',
      disponible BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      reference VARCHAR(24) UNIQUE NOT NULL,
      client_nom VARCHAR(100) NOT NULL,
      client_telephone VARCHAR(20) NOT NULL,
      adresse VARCHAR(500) NOT NULL,
      notes VARCHAR(500) NOT NULL DEFAULT '',
      total_fcfa INTEGER NOT NULL CHECK (total_fcfa >= 0),
      statut VARCHAR(32) NOT NULL DEFAULT 'En attente',
      paiement_statut VARCHAR(32) NOT NULL DEFAULT 'Non payé',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      plat_id TEXT NOT NULL,
      plat_nom VARCHAR(120) NOT NULL,
      prix_unitaire INTEGER NOT NULL CHECK (prix_unitaire >= 0),
      quantite INTEGER NOT NULL CHECK (quantite BETWEEN 1 AND 50),
      sous_total INTEGER NOT NULL CHECK (sous_total >= 0)
    );
  `)
  const count = await pool.query('SELECT COUNT(*)::int AS count FROM menu_items')
  if (count.rows[0].count === 0) {
    for (const item of menuInitial) {
      await pool.query(
        'INSERT INTO menu_items (id, nom, description, prix, categorie, emoji, disponible) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
        [item.id, item.nom, item.description, item.prix, item.categorie, item.emoji, item.disponible],
      )
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' })
  }
})

app.get('/api/menu', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nom, description, prix, categorie, emoji, disponible FROM menu_items ORDER BY categorie, nom',
    )
    res.json(rows)
  } catch (error) {
    console.error('GET /api/menu failed:', error.message)
    res.status(503).json({ error: 'Le menu est temporairement indisponible.' })
  }
})

app.post('/api/commandes', async (req, res) => {
  const { client, articles } = req.body ?? {}
  const nom = typeof client?.nom === 'string' ? client.nom.trim() : ''
  const telephone = typeof client?.telephone === 'string' ? client.telephone.trim() : ''
  const adresse = typeof client?.adresse === 'string' ? client.adresse.trim() : ''
  const notes = typeof client?.notes === 'string' ? client.notes.trim() : ''

  if (nom.length < 2 || nom.length > 100) return res.status(400).json({ error: 'Le nom doit contenir entre 2 et 100 caractères.' })
  if (!/^\+?[0-9\s().-]{8,20}$/.test(telephone)) return res.status(400).json({ error: 'Le numéro de téléphone est invalide.' })
  if (adresse.length < 4 || adresse.length > 500) return res.status(400).json({ error: 'Veuillez préciser une adresse de livraison valide.' })
  if (notes.length > 500) return res.status(400).json({ error: 'Les notes ne peuvent pas dépasser 500 caractères.' })
  if (!Array.isArray(articles) || articles.length < 1 || articles.length > 30) return res.status(400).json({ error: 'Le panier doit contenir entre 1 et 30 plats différents.' })

  const quantites = new Map()
  for (const article of articles) {
    if (!article || typeof article.platId !== 'string' || !Number.isInteger(article.quantite) || article.quantite < 1 || article.quantite > 50) {
      return res.status(400).json({ error: 'Un article du panier est invalide.' })
    }
    if (quantites.has(article.platId)) return res.status(400).json({ error: 'Chaque plat doit apparaître une seule fois dans le panier.' })
    quantites.set(article.platId, article.quantite)
  }

  const ids = [...quantites.keys()]
  const connection = await pool.connect()
  try {
    await connection.query('BEGIN')
    const result = await connection.query(
      'SELECT id, nom, prix, disponible FROM menu_items WHERE id = ANY($1::text[]) FOR SHARE',
      [ids],
    )
    if (result.rows.length !== ids.length) {
      await connection.query('ROLLBACK')
      return res.status(400).json({ error: 'Un plat de votre panier n’existe plus dans le menu.' })
    }
    const items = result.rows
    const indisponible = items.find(item => !item.disponible)
    if (indisponible) {
      await connection.query('ROLLBACK')
      return res.status(409).json({ error: `${indisponible.nom} n’est plus disponible. Actualisez le menu.` })
    }
    const total = items.reduce((sum, item) => sum + item.prix * quantites.get(item.id), 0)
    if (!Number.isSafeInteger(total) || total > 10000000) {
      await connection.query('ROLLBACK')
      return res.status(400).json({ error: 'Le montant de la commande dépasse la limite autorisée.' })
    }
    const reference = `FF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const created = await connection.query(
      'INSERT INTO orders (reference, client_nom, client_telephone, adresse, notes, total_fcfa) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, reference, total_fcfa, statut, created_at',
      [reference, nom, telephone, adresse, notes, total],
    )
    const order = created.rows[0]
    for (const item of items) {
      const quantite = quantites.get(item.id)
      await connection.query(
        'INSERT INTO order_items (order_id, plat_id, plat_nom, prix_unitaire, quantite, sous_total) VALUES ($1,$2,$3,$4,$5,$6)',
        [order.id, item.id, item.nom, item.prix, quantite, item.prix * quantite],
      )
    }
    await connection.query('COMMIT')
    res.status(201).json({ id: order.id, reference: order.reference, total: order.total_fcfa, statut: order.statut, createdAt: order.created_at })
  } catch (error) {
    await connection.query('ROLLBACK').catch(() => {})
    console.error('POST /api/commandes failed:', error.message)
    res.status(500).json({ error: 'La commande n’a pas pu être enregistrée. Réessayez.' })
  } finally {
    connection.release()
  }
})

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Le corps de la requête JSON est invalide.' })
  console.error('Unexpected API error:', error.message)
  return res.status(500).json({ error: 'Une erreur inattendue est survenue.' })
})

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Configure PostgreSQL before starting the API.')
    process.exit(1)
  }
  await initializeDatabase()
  app.listen(port, '0.0.0.0', () => console.log(`FastFood API listening on port ${port}`))
}

start().catch(error => {
  console.error('Failed to start FastFood API:', error.message)
  process.exit(1)
})
