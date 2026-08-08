const Notification = require('../model/Notification');

// Instance Socket.IO (sera initialisée dans server.js)
let io = null;

/**
 * Initialiser Socket.IO
 */
const initSocketIO = (socketIOInstance) => {
    io = socketIOInstance;
    console.log('✅ Notification service : Socket.IO connecté');
};

/**
 * Créer une notification et l'envoyer en temps réel
 */
const createNotification = async ({
    utilisateurId,
    type,
    titre,
    message,
    icone = 'Bell',
    couleur = 'blue',
    lien = null,
    data = null
}) => {
    try {
        // Créer en BDD
        const notification = await Notification.create({
            utilisateur: utilisateurId,
            type,
            titre,
            message,
            icone,
            couleur,
            lien,
            data
        });

        // Envoyer en temps réel via Socket.IO
        if (io) {
            io.to(`user:${utilisateurId}`).emit('nouvelle_notification', notification);
            console.log(`🔔 Notif envoyée à user:${utilisateurId} - ${titre}`);
        } else {
            console.warn('⚠️ Socket.IO non initialisé, notif créée sans push temps réel');
        }

        return notification;
    } catch (error) {
        console.error('❌ Erreur createNotification:', error);
        throw error;
    }
};

/**
 * Notifier tous les admins
 */
const notifyAdmins = async (data) => {
    const Utilisateur = require('../model/User');
    const admins = await Utilisateur.find({ role: 'admin' }).select('_id');
    
    for (const admin of admins) {
        await createNotification({
            utilisateurId: admin._id,
            ...data
        });
    }
};

module.exports = {
    initSocketIO,
    createNotification,
    notifyAdmins
};