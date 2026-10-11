<script setup>
import { computed, onMounted, ref } from 'vue'

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const fallbackMenu = [
  { id: 'burger-classic', nom: 'Burger Classic', description: 'Steak grillé, cheddar fondant, salade croquante et sauce maison.', prix: 3500, categorie: 'Burgers', emoji: '🍔', disponible: true },
  { id: 'poulet-frites', nom: 'Poulet & frites', description: 'Poulet doré et frites croustillantes, préparés à la commande.', prix: 4000, categorie: 'Menus', emoji: '🍗', disponible: true },
  { id: 'tacos-viande', nom: 'Tacos viande', description: 'Tortilla généreuse, viande épicée, fromage et sauce crémeuse.', prix: 3000, categorie: 'Tacos', emoji: '🌮', disponible: true },
  { id: 'frites', nom: 'Frites maison', description: 'Une portion de frites bien dorées à partager… ou pas.', prix: 1200, categorie: 'Accompagnements', emoji: '🍟', disponible: true },
  { id: 'jus-bissap', nom: 'Bissap frais', description: 'Boisson locale fraîche, légèrement acidulée.', prix: 800, categorie: 'Boissons', emoji: '🥤', disponible: true },
  { id: 'nuggets', nom: 'Nuggets croustillants', description: 'Bouchées de poulet panées, avec une sauce au choix.', prix: 2200, categorie: 'Accompagnements', emoji: '🍗', disponible: true },
]
const menu = ref([])
const panier = ref([])
const categorieActive = ref('Tout')
const recherche = ref('')
const chargement = ref(true)
const erreurMenu = ref('')
const panierOuvert = ref(false)
const formulaireOuvert = ref(false)
const envoi = ref(false)
const message = ref('')
const erreurCommande = ref('')
const client = ref({ nom: '', telephone: '', adresse: '', notes: '' })

const categories = computed(() => ['Tout', ...new Set(menu.value.map(p => p.categorie || 'Autres'))])
const platsFiltres = computed(() => menu.value.filter(p => {
  const matchCategorie = categorieActive.value === 'Tout' || (p.categorie || 'Autres') === categorieActive.value
  const terme = recherche.value.trim().toLocaleLowerCase('fr')
  return matchCategorie && (!terme || `${p.nom} ${p.description || ''}`.toLocaleLowerCase('fr').includes(terme))
}))
const quantiteTotale = computed(() => panier.value.reduce((total, ligne) => total + ligne.quantite, 0))
const total = computed(() => panier.value.reduce((somme, ligne) => somme + ligne.prix * ligne.quantite, 0))
const formValide = computed(() => client.value.nom.trim() && /^\+?[0-9\s().-]{8,20}$/.test(client.value.telephone.trim()) && client.value.adresse.trim() && panier.value.length)

function prix(valeur) {
  return new Intl.NumberFormat('fr-FR').format(Number(valeur) || 0) + ' FCFA'
}
function ajouter(plat) {
  if (plat.disponible === false) return
  const ligne = panier.value.find(p => p.id === plat.id)
  if (ligne) ligne.quantite++
  else panier.value.push({ ...plat, quantite: 1 })
  message.value = `${plat.nom} ajouté au panier`
  window.setTimeout(() => { message.value = '' }, 2200)
}
function modifierQuantite(id, delta) {
  const ligne = panier.value.find(p => p.id === id)
  if (!ligne) return
  ligne.quantite += delta
  if (ligne.quantite <= 0) panier.value = panier.value.filter(p => p.id !== id)
}
async function chargerMenu() {
  chargement.value = true
  try {
    const reponse = await fetch(`${API_URL}/api/menu`)
    if (!reponse.ok) throw new Error('Menu indisponible')
    const donnees = await reponse.json()
    menu.value = Array.isArray(donnees) && donnees.length ? donnees.map(p => ({ ...p, emoji: p.emoji || '🍽️', categorie: p.categorie || 'Nos plats', disponible: p.disponible !== false })) : fallbackMenu
  } catch {
    menu.value = fallbackMenu
    erreurMenu.value = API_URL ? 'Le menu de démonstration est affiché : le serveur est momentanément inaccessible.' : 'Menu de démonstration. Connectez l’API pour activer les commandes.'
  } finally {
    chargement.value = false
  }
}
async function envoyerCommande() {
  erreurCommande.value = ''
  if (!formValide.value) {
    erreurCommande.value = 'Renseignez votre nom, un téléphone valide et votre adresse de livraison.'
    return
  }
  envoi.value = true
  try {
    const reponse = await fetch(`${API_URL}/api/commandes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client: { nom: client.value.nom.trim(), telephone: client.value.telephone.trim(), adresse: client.value.adresse.trim(), notes: client.value.notes.trim() },
        articles: panier.value.map(p => ({ platId: p.id, quantite: p.quantite })),
      }),
    })
    const donnees = await reponse.json().catch(() => ({}))
    if (!reponse.ok) throw new Error(donnees.error || 'Impossible d’enregistrer la commande.')
    message.value = `Commande ${donnees.reference || '#' + donnees.id} enregistrée ! Le paiement sera confirmé séparément.`
    panier.value = []
    client.value = { nom: '', telephone: '', adresse: '', notes: '' }
    formulaireOuvert.value = false
    panierOuvert.value = false
  } catch (e) {
    erreurCommande.value = API_URL ? e.message : 'Les commandes ne sont pas encore connectées au serveur. Le panier fonctionne en mode aperçu.'
  } finally {
    envoi.value = false
  }
}
onMounted(chargerMenu)
</script>

<template>
  <div class="app-shell">
    <div class="topline"><span>🍊</span> Du bon, du frais, du bonheur. <span class="topline-right">Fait avec gourmandise au Sénégal</span></div>
    <header class="site-header">
      <a class="brand" href="#" aria-label="FastFood accueil"><span class="brand-mark">F</span><span>fast<span class="brand-accent">food</span><small>LE BON GOÛT, SANS ATTENDRE</small></span></a>
      <nav class="desktop-nav"><a href="#menu">Notre menu</a><a href="#promesse">Notre promesse</a><a href="#contact">Nous trouver</a></nav>
      <button class="cart-button" @click="panierOuvert = true" aria-label="Ouvrir le panier">Panier <span>{{ quantiteTotale }}</span></button>
    </header>

    <main>
      <section class="hero">
        <div class="hero-copy">
          <div class="eyebrow"><span class="eyebrow-dot"></span> LE BONHEUR EST AU MENU</div>
          <h1>Une faim.<br>Une envie.<br><span>Un régal.</span></h1>
          <p>Des recettes généreuses, des ingrédients choisis et du goût à chaque bouchée. Ton prochain repas préféré est ici.</p>
          <div class="hero-actions"><a class="primary-button" href="#menu">Découvrir le menu <span>↘</span></a><span class="delivery-note"><span>⚡</span> Simple, rapide, gourmand</span></div>
          <div class="social-proof"><div class="avatar-stack"><span>🍔</span><span>🍟</span><span>🥤</span></div><div><strong>Du goût à chaque commande</strong><small>Préparé avec soin, rien que pour toi.</small></div></div>
        </div>
        <div class="hero-art" aria-label="Illustration d'un repas gourmand">
          <div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div>
          <span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✦</span>
          <div class="hero-food">🍔</div>
          <div class="floating-card floating-rating"><span>★★★★★</span><strong>100% gourmand</strong><small>La bonne humeur en plus</small></div>
          <div class="floating-card floating-price"><span>À PARTIR DE</span><strong>800 <small>FCFA</small></strong><small>De quoi se faire plaisir</small></div>
          <div class="art-caption">LE PLAISIR, C'EST SÉRIEUX.</div>
        </div>
      </section>

      <section class="benefits" id="promesse">
        <div><span class="benefit-icon">🥬</span><span><strong>Des ingrédients choisis</strong><small>La qualité dans chaque recette</small></span></div>
        <div><span class="benefit-icon">👨🏽‍🍳</span><span><strong>Préparé à la commande</strong><small>Du soin, pas de compromis</small></span></div>
        <div><span class="benefit-icon">🛵</span><span><strong>Livraison pratique</strong><small>On vous aide à vous régaler</small></span></div>
      </section>

      <section class="menu-section" id="menu">
        <div class="section-heading"><div><div class="eyebrow">FAIT POUR TE FAIRE PLAISIR</div><h2>Le menu <span>qui régale.</span></h2><p>Ton envie du moment est forcément par ici.</p></div><label class="search-box"><span>⌕</span><input v-model="recherche" placeholder="Une petite envie ?" aria-label="Rechercher un plat"></label></div>
        <div class="category-row"><button v-for="cat in categories" :key="cat" :class="{ active: categorieActive === cat }" @click="categorieActive = cat">{{ cat }}</button></div>
        <p v-if="erreurMenu" class="demo-notice">{{ erreurMenu }}</p>
        <div v-if="chargement" class="loading-state">On prépare le menu…</div>
        <div v-else-if="platsFiltres.length" class="product-grid">
          <article v-for="(plat, index) in platsFiltres" :key="plat.id" class="product-card" :style="{ '--delay': index * 60 + 'ms' }">
            <div class="product-art" :class="'art-' + (index % 4)"><span class="product-emoji">{{ plat.emoji }}</span><span class="product-tag">{{ plat.categorie }}</span><span v-if="plat.disponible === false" class="unavailable">Indisponible</span><span v-else class="product-spark">✳</span></div>
            <div class="product-info"><div><h3>{{ plat.nom }}</h3><p>{{ plat.description }}</p></div><div class="product-bottom"><strong>{{ prix(plat.prix) }}</strong><button :disabled="plat.disponible === false" @click="ajouter(plat)" :aria-label="'Ajouter ' + plat.nom">+</button></div></div>
          </article>
        </div>
        <div v-else class="empty-state">Aucun plat ne correspond à cette recherche. Essaie un autre mot !</div>
      </section>

      <section class="closing-banner"><div class="banner-emoji">😋</div><div><span>UNE PETITE FAIM ?</span><h2>Fais-toi plaisir, <em>tu l'as mérité.</em></h2><p>Quelques clics et ton prochain coup de cœur est commandé.</p></div><a href="#menu" class="banner-button">Je choisis mon plat ↗</a></section>
    </main>

    <footer id="contact"><a class="brand footer-brand" href="#"><span class="brand-mark">F</span><span>fast<span class="brand-accent">food</span><small>LE BON GOÛT, SANS ATTENDRE</small></span></a><p>Des repas généreux, des sourires sincères. ❤️</p><small>© {{ new Date().getFullYear() }} FastFood. Fait avec gourmandise.</small></footer>

    <Transition name="toast"><div v-if="message" class="toast-message" role="status">{{ message }}</div></Transition>
    <div v-if="panierOuvert || formulaireOuvert" class="overlay" @click.self="panierOuvert = false; formulaireOuvert = false">
      <aside class="cart-drawer">
        <div class="drawer-header"><div><span class="eyebrow">TA SÉLECTION</span><h2>{{ formulaireOuvert ? 'Finaliser la commande' : 'Ton panier' }}</h2></div><button class="close-button" @click="panierOuvert = false; formulaireOuvert = false" aria-label="Fermer">×</button></div>
        <template v-if="!formulaireOuvert">
          <div v-if="!panier.length" class="empty-cart"><span>🛍️</span><h3>Ton panier est vide</h3><p>Il ne demande qu'à être rempli de bonnes choses.</p><button class="primary-button" @click="panierOuvert = false">Explorer le menu</button></div>
          <div v-else class="cart-content"><div v-for="ligne in panier" :key="ligne.id" class="cart-line"><span class="cart-line-emoji">{{ ligne.emoji }}</span><div class="cart-line-info"><strong>{{ ligne.nom }}</strong><small>{{ prix(ligne.prix) }}</small><div class="quantity"><button @click="modifierQuantite(ligne.id, -1)">−</button><span>{{ ligne.quantite }}</span><button @click="modifierQuantite(ligne.id, 1)">+</button></div></div><strong>{{ prix(ligne.prix * ligne.quantite) }}</strong></div><div class="cart-total"><span>Total estimé</span><strong>{{ prix(total) }}</strong></div><p class="cart-hint">Le montant définitif est calculé et vérifié par le serveur.</p><button class="primary-button full-button" @click="formulaireOuvert = true">Continuer ma commande <span>→</span></button></div>
        </template>
        <form v-else class="checkout-form" @submit.prevent="envoyerCommande"><p class="form-intro">Où doit-on t'apporter ces bonnes choses ?</p><label>Ton nom<input v-model="client.nom" required maxlength="100" autocomplete="name" placeholder="Prénom et nom"></label><label>Téléphone<input v-model="client.telephone" required maxlength="20" type="tel" autocomplete="tel" placeholder="+221 77 000 00 00"></label><label>Adresse de livraison<textarea v-model="client.adresse" required maxlength="500" autocomplete="street-address" rows="3" placeholder="Quartier, rue, repère…"></textarea></label><label>Un détail à préciser <small>(facultatif)</small><textarea v-model="client.notes" maxlength="500" rows="2" placeholder="Sans piment, appeler en arrivant…"></textarea></label><div class="cart-total"><span>Total estimé</span><strong>{{ prix(total) }}</strong></div><p class="cart-hint">Aucun paiement n'est prélevé à cette étape.</p><p v-if="erreurCommande" class="form-error">{{ erreurCommande }}</p><button class="primary-button full-button" :disabled="envoi || !formValide">{{ envoi ? 'Enregistrement…' : 'Confirmer la commande' }}</button><button type="button" class="text-button" @click="formulaireOuvert = false">← Retour au panier</button></form>
      </aside>
    </div>
  </div>
</template>
