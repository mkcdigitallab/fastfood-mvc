/**
 * MODEL : Plat
 */

let plats = [
  { id: 1, nom: 'Burger Classic', prix: 3500, description: 'Steak, cheddar, salade, tomate' },
  { id: 2, nom: 'Menu Poulet Frites', prix: 4000, description: 'Poulet grillé, frites, boisson' },
  { id: 3, nom: 'Tacos Viande', prix: 3000, description: 'Tacos boeuf, sauce fromagère' }
];
let prochainId = 4;

module.exports = {

  /**
   * Cas d'utilisation "Ajouter un plat au menu" (Gérant)
   */
  ajouter(nom, prix, description) {
    const plat = { id: prochainId++, nom, prix, description };
    plats.push(plat);
    return plat;
  },

  /**
   * Scénario 1 - RG2 : vérifie la disponibilité d'un plat
   */
  verifierDisponibilite(platId) {
    return plats.some(p => p.id === platId);
  },

  trouverParId(platId) {
    return plats.find(p => p.id === platId);
  },

  tousLesPlats() {
    return plats;
  }
};
