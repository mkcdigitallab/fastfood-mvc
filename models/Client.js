/**
 * MODEL : Client
 */

let clients = [
  { id: 1, nom: 'Malang Kiya Ciss', email: 'malang.ciss@example.com' }
];

module.exports = {
  trouverParId(clientId) {
    return clients.find(c => c.id === clientId);
  },

  tousLesClients() {
    return clients;
  }
};
