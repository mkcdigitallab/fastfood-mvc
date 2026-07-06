/**
 * CONTROLLER - Scénario 1 : "Passer une commande"
 */

const Plat = require('../models/Plat');
const Commande = require('../models/Commande');

module.exports = {

  afficherFormulaire(req, res) {
    res.sendFile('passer-commande.html', { root: 'views' });
  },

  afficherMenu(req, res) {
    res.json({ success: true, plats: Plat.tousLesPlats() });
  },

  // RG1, RG2, RG3, RG4
  passerCommande(req, res) {
    const { clientId, lignes } = req.body;
    // lignes = [{ platId, quantite }, ...]

    // RG2 : vérifier la disponibilité de chaque plat
    for (const ligne of lignes) {
      if (!Plat.verifierDisponibilite(ligne.platId)) {
        return res.status(400).json({
          success: false,
          message: `Le plat ${ligne.platId} n'est pas disponible`
        });
      }
    }

    // RG3 : calcul du montant total (fait dans enregistrer())
    // RG4 : enregistrement avec statut "En attente"
    const commande = Commande.enregistrer(clientId, lignes);

    res.json({
      success: true,
      message: 'Commande enregistrée avec le statut "En attente"',
      commande
    });
  }
};
