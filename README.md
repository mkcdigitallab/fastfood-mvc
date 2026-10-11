# FastFood — commande de repas

FastFood évolue du prototype MVC vers une application de commande construite avec Vue 3, Express et PostgreSQL. L'objectif est une expérience mobile-first simple pour les clients, et une base technique qui pourra accueillir les outils de gestion du restaurant.

## Architecture

```text
frontend/              Application Vue 3 + Vite
  src/App.vue          Menu, recherche, panier et formulaire de commande
  src/style.css        Interface responsive
server/
  index.js             API Express et règles métier de commande
  package.json         Dépendances du serveur
models/ controllers/   Prototype MVC historique conservé pendant la transition
views/                 Anciennes maquettes HTML conservées
render.yaml            Déclaration des services Render
```

## Fonctionnalités du premier incrément

- Menu chargé depuis l'API, avec données de démonstration si l'API n'est pas joignable.
- Recherche, filtres par catégorie, panier et quantités.
- Formulaire client adapté au mobile.
- Validation des entrées côté serveur ; les prix envoyés par le navigateur ne sont jamais utilisés pour calculer le total.
- Commandes et lignes de commande enregistrées en PostgreSQL dans une transaction.
- Refus des plats inconnus ou indisponibles.
- Point de santé `GET /api/health`.

## Développement local

Prérequis : Node.js 20+ et PostgreSQL.

### API

```bash
cd server
npm install
DATABASE_URL='postgresql://utilisateur:motdepasse@localhost:5432/fastfood' npm start
```

L'API écoute sur `http://localhost:10000`. La base et les tables sont initialisées au démarrage.

### Frontend

Dans un autre terminal :

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:10000 npm run dev
```

Ouvrir l'adresse Vite affichée dans le terminal. Si `VITE_API_URL` est vide, l'interface affiche le menu de démonstration et les commandes ne sont pas envoyées.

## Déploiement Render

Le fichier `render.yaml` décrit deux services et une base PostgreSQL dans la région de Francfort :

1. `fastfood-db` — PostgreSQL.
2. `fastfood-api` — API Node/Express.
3. `fastfood-vue` — site statique Vue compilé.

Depuis Render, créer un Blueprint à partir du dépôt et sélectionner la branche de travail. Vérifier les noms publics des services et que `VITE_API_URL` et `CORS_ORIGIN` correspondent à leurs URL effectives avant le premier déploiement.

## Limites à traiter avant un lancement commercial

Ce premier incrément n'intègre pas encore l'authentification, un espace protégé pour le personnel, le suivi de commande côté client, l'attribution opérationnelle des livreurs, les notifications ni un prestataire de paiement réel. Le statut de paiement reste « Non payé » : aucune carte n'est débitée. Ne pas collecter de données de carte bancaire dans cette version.

Le menu initial est amorcé automatiquement dans la base au premier lancement. La gestion du menu et des disponibilités devra ensuite être protégée par des rôles et une authentification avant d'être exposée à une équipe réelle.

## Projet d'origine

Les contrôleurs, modèles et wireframes MVC de l'exercice initial restent présents pour faciliter la comparaison et une migration progressive.
