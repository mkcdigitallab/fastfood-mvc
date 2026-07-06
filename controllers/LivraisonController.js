/**
 * CONTROLLER - Scénario 4 : "Assigner un livreur"
 */

const Commande = require('../models/Commande');
const Livreur = require('../models/Livreur');
const Notification = require('../models/Notification');

module.exports = {

  afficherFormulaire(req, res) {
    res.sendFile('assigner-livreur.html', { root: 'views' });
  },

  // RG2 : affiche la liste des livreurs "Disponibles"
  listerLivreursDisponibles(req, res) {
    res.json({ success: true, livreurs: Livreur.trouverDisponibles() });
  },

  // RG1, RG3, RG4
  assignerLivreur(req, res) {
    const { commandeId, livreurId } = req.body;
    const commande = Commande.trouverParId(Number(commandeId));
    const livreur = Livreur.trouverParId(Number(livreurId));

    if (!commande || !livreur || livreur.statut !== 'Disponible') {
      return res.status(400).json({ success: false, message: 'Assignation impossible' });
    }

    // RG4 : commande -> "En livraison", livreur -> "Occupé"
    const commandeMaj = Commande.assignerLivreur(commande.id, livreur.id);
    Livreur.marquerOccupe(livreur.id);

    // RG4 : notification au livreur
    Notification.notifierLivreur(livreur.id, commandeMaj);

    res.json({ success: true, message: 'Livreur assigné et notifié' });
  }
};
