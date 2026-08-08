const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // À qui appartient cette notification
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true,
        index: true
    },
    // Type de notification
    type: {
        type: String,
        enum: [
            'nouvelle_reservation',
            'reservation_confirmee',
            'reservation_annulee',
            'reservation_terminee',
            'nouvel_avis',
            'nouvel_hotel',
            'nouveau_client',
            'hotel_verifie',
            'paiement_recu',
            'systeme'
        ],
        required: true
    },
    // Titre court
    titre: {
        type: String,
        required: true
    },
    // Message détaillé
    message: {
        type: String,
        required: true
    },
    // Icône (nom de l'icône Lucide)
    icone: {
        type: String,
        default: 'Bell'
    },
    // Couleur (pour le style)
    couleur: {
        type: String,
        enum: ['blue', 'green', 'red', 'yellow', 'purple', 'gray'],
        default: 'blue'
    },
    // Lien vers la page concernée (ex: "/client/reservations/123")
    lien: {
        type: String
    },
    // Données additionnelles (JSON)
    data: {
        type: Object
    },
    // A été lue ?
    lue: {
        type: Boolean,
        default: false,
        index: true
    },
    dateLu: {
        type: Date
    }
}, {
    timestamps: true
});

// Index composé pour les requêtes rapides
notificationSchema.index({ utilisateur: 1, createdAt: -1 });
notificationSchema.index({ utilisateur: 1, lue: 1 });

module.exports = mongoose.model('Notification', notificationSchema);