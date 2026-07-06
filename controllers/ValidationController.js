/**
 * CONTROLLER - Scénario 3 : "Valider une commande entrante"
 */

const Commande = require('../models/Commande');
const Notification = require('../models/Notification');

module.exports = {

  afficherFormulaire(req, res) {
    res.sendFile('valider-commande.html', { root: 'views' });
  },

  // RG1 : liste des commandes "Payées"
  listerCommandesPayees(req, res) {
    res.json({ success: true, commandes: Commande.trouverParStatut('Payée') });
  },

  // RG2, RG3, RG4
  validerCommande(req, res) {
    const { commandeId } = req.body;
    const commande = Commande.trouverParId(Number(commandeId));

    if (!commande || commande.statut !== 'Payée') {
      return res.status(400).json({ success: false, message: 'Commande non validable' });
    }

    // RG3 : met à jour le statut à "En préparation"
    const commandeMaj = Commande.marquerEnPreparation(commande.id);

    // RG4 : notifie automatiquement le client
    Notification.notifierClient(commande.clientId, commandeMaj);

    res.json({ success: true, message: 'Commande en préparation, client notifié' });
  }
};
