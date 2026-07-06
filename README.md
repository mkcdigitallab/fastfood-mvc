# Système de Gestion de Commandes Fast-Food — MVC

Architecture MVC (Node.js / Express) implémentant les 4 scénarios de séquence de l'exercice 2.

## Structure

```
models/         → Entités métier (Plat, Commande, Client, Livreur, Notification)
controllers/    → Logique de traitement, un fichier par scénario
views/          → Maquettes HTML des 4 écrans (wireframes)
routes/         → Déclaration des routes de l'application
app.js          → Point d'entrée
```

## Correspondance scénarios ↔ code

| Scénario | Controller | Fonctions clés | Vue |
|---|---|---|---|
| 1. Passer une commande | `CommandeController.js` | `verifierDisponibilite()`, `calculerMontantTotal()`, `enregistrer()` | `passer-commande.html` |
| 2. Payer une commande en ligne | `PaiementController.js` | `contacterSystemeBancaire()`, `marquerPayee()` | `payer-commande.html` |
| 3. Valider une commande entrante | `ValidationController.js` | `marquerEnPreparation()`, `notifierClient()` | `valider-commande.html` |
| 4. Assigner un livreur | `LivraisonController.js` | `trouverDisponibles()`, `assignerLivreur()`, `notifierLivreur()` | `assigner-livreur.html` |

## Lancer le projet

```bash
npm install
npm start
```

Puis ouvrir : `http://localhost:3000/commande`, `/paiement`, `/validation`, `/livraison`

## Connecter au dépôt GitHub

Ce dépôt local est déjà initialisé avec un premier commit. Pour le publier sur GitHub :

```bash
git remote add origin https://github.com/TON-USERNAME/fastfood-mvc.git
git branch -M main
git push -u origin main
```
