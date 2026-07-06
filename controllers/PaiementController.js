/**
 * CONTROLLER - Scénario 2 : "Payer une commande en ligne"
 */

const Commande = require('../models/Commande');

// Simule le Système Bancaire externe
function contacterSystemeBancaire(montant, infosCarte) {
  // Simulation : toujours validé pour la démo
  return { valide: true, transactionId: 'TXN-' + Date.now() };
}

module.exports = {

  afficherFormulaire(req, res) {
    res.sendFile('payer-commande.html', { root: 'views' });
  },

  // RG1, RG2, RG3, RG4
  payerCommande(req, res) {
    const { commandeId, infosCarte } = req.body;
    const commande = Commande.trouverParId(Number(commandeId));

    if (!commande || commande.statut !== 'En attente') {
      return res.status(400).json({ success: false, message: 'Commande non payable' });
    }

    // RG2 : transmet les informations de paiement au Système Bancaire
    // RG3 : le Système Bancaire valide la transaction
    const resultat = contacterSystemeBancaire(commande.montantTotal, infosCarte);

    if (!resultat.valide) {
      return res.status(402).json({ success: false, message: 'Paiement refusé' });
    }

    // RG4 : met à jour le statut à "Payée" et génère un reçu
    const commandePayee = Commande.marquerPayee(commande.id);
    const recu = {
      commandeId: commandePayee.id,
      montant: commandePayee.montantTotal,
      transactionId: resultat.transactionId,
      date: new Date().toISOString()
    };

    res.json({ success: true, message: 'Paiement confirmé', recu });
  }
};
