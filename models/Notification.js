/**
 * MODEL : Notification
 * Représente le "Système de Notification" du diagramme de cas d'utilisation
 */

let notifications = [];
let prochainId = 1;

module.exports = {

  /**
   * Scénario 3 - RG4 : notifie automatiquement le client
   * que sa commande est en préparation
   */
  notifierClient(clientId, commande) {
    const notif = {
      id: prochainId++,
      destinataire: `client-${clientId}`,
      contenu: `Votre commande #${commande.id} est en préparation`,
      dateEnvoi: new Date().toISOString()
    };
    notifications.push(notif);
    console.log(`[NOTIFICATION] ${notif.contenu} -> ${notif.destinataire}`);
    return notif;
  },

  /**
   * Scénario 4 - RG4 : envoie une notification d'assignation au livreur
   */
  notifierLivreur(livreurId, commande) {
    const notif = {
      id: prochainId++,
      destinataire: `livreur-${livreurId}`,
      contenu: `Nouvelle livraison assignée : commande #${commande.id}`,
      dateEnvoi: new Date().toISOString()
    };
    notifications.push(notif);
    console.log(`[NOTIFICATION] ${notif.contenu} -> ${notif.destinataire}`);
    return notif;
  },

  toutesLesNotifications() {
    return notifications;
  }
};
