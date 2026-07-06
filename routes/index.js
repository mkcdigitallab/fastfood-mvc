const express = require('express');
const router = express.Router();

const CommandeController = require('../controllers/CommandeController');
const PaiementController = require('../controllers/PaiementController');
const ValidationController = require('../controllers/ValidationController');
const LivraisonController = require('../controllers/LivraisonController');

// Scénario 1 : Passer une commande (Client)
router.get('/commande', CommandeController.afficherFormulaire);
router.get('/api/menu', CommandeController.afficherMenu);
router.post('/api/commandes', CommandeController.passerCommande);

// Scénario 2 : Payer une commande en ligne (Client)
router.get('/paiement', PaiementController.afficherFormulaire);
router.post('/api/paiements', PaiementController.payerCommande);

// Scénario 3 : Valider une commande entrante (Gérant)
router.get('/validation', ValidationController.afficherFormulaire);
router.get('/api/commandes/payees', ValidationController.listerCommandesPayees);
router.post('/api/commandes/valider', ValidationController.validerCommande);

// Scénario 4 : Assigner un livreur (Gérant)
router.get('/livraison', LivraisonController.afficherFormulaire);
router.get('/api/livreurs/disponibles', LivraisonController.listerLivreursDisponibles);
router.post('/api/livraisons/assigner', LivraisonController.assignerLivreur);

module.exports = router;
