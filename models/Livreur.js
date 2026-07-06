/**
 * MODEL : Livreur
 * statut possible : "Disponible" | "Occupé"
 */

let livreurs = [
  { id: 1, nom: 'Ibrahima Sarr', statut: 'Disponible' },
  { id: 2, nom: 'Ousmane Ba', statut: 'Disponible' },
  { id: 3, nom: 'Modou Diallo', statut: 'Occupé' }
];

module.exports = {

  /**
   * Scénario 4 - RG2 : liste des livreurs "Disponibles"
   */
  trouverDisponibles() {
    return livreurs.filter(l => l.statut === 'Disponible');
  },

  /**
   * Scénario 4 - RG4 : le livreur devient "Occupé"
   */
  marquerOccupe(livreurId) {
    const livreur = livreurs.find(l => l.id === livreurId);
    if (!livreur) return null;
    livreur.statut = 'Occupé';
    return livreur;
  },

  trouverParId(livreurId) {
    return livreurs.find(l => l.id === livreurId);
  },

  tousLesLivreurs() {
    return livreurs;
  }
};
