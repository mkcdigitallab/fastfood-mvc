/**
 * MODEL : Commande
 * statut possible : "En attente" | "Payée" | "En préparation" | "En livraison"
 */

const Plat = require('./Plat');

let commandes = [];
let prochainId = 1;

module.exports = {

  /**
   * Scénario 1 - RG3 : calcule le montant total à partir des lignes de commande
   */
  calculerMontantTotal(lignes) {
    return lignes.reduce((total, ligne) => {
      const plat = Plat.trouverParId(ligne.platId);
      return total + (plat ? plat.prix * ligne.quantite : 0);
    }, 0);
  },

  /**
   * Scénario 1 - RG4 : enregistre la commande avec le statut "En attente"
   */
  enregistrer(clientId, lignes) {
    const montantTotal = this.calculerMontantTotal(lignes);
    const commande = {
      id: prochainId++,
      clientId,
      lignes,
      montantTotal,
      statut: 'En attente',
      livreurId: null,
      date: new Date().toISOString()
    };
    commandes.push(commande);
    return commande;
  },

  /**
   * Scénario 2 - RG4 : met à jour la commande au statut "Payée"
   */
  marquerPayee(commandeId) {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) return null;
    commande.statut = 'Payée';
    return commande;
  },

  /**
   * Scénario 3 - RG3 : met à jour la commande au statut "En préparation"
   */
  marquerEnPreparation(commandeId) {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) return null;
    commande.statut = 'En préparation';
    return commande;
  },

  /**
   * Scénario 4 - RG4 : passe la commande au statut "En livraison"
   * et lui assigne un livreur
   */
  assignerLivreur(commandeId, livreurId) {
    const commande = commandes.find(c => c.id === commandeId);
    if (!commande) return null;
    commande.statut = 'En livraison';
    commande.livreurId = livreurId;
    return commande;
  },

  trouverParStatut(statut) {
    return commandes.filter(c => c.statut === statut);
  },

  trouverParId(commandeId) {
    return commandes.find(c => c.id === commandeId);
  },

  trouverParClient(clientId) {
    return commandes.filter(c => c.clientId === clientId);
  },

  toutesLesCommandes() {
    return commandes;
  }
};
