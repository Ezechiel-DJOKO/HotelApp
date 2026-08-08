const mongoose = require('mongoose');

const reversementSchema = new mongoose.Schema({
    // Hôtel qui reçoit
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    // Propriétaire de l'hôtel
    proprietaire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    // Admin qui effectue
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },

    // Numéro unique
    numeroReversement: {
        type: String,
        unique: true,
        required: true
    },

    // Transactions incluses
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    }],

    // Montant total versé
    montantTotal: {
        type: Number,
        required: true
    },
    devise: {
        type: String,
        default: 'XOF'
    },

    // Nombre de transactions
    nombreTransactions: {
        type: Number,
        required: true
    },

    // Méthode de reversement
    methode: {
        type: String,
        enum: ['mtn_momo', 'moov_money', 'orange_money', 'wave', 'virement_bancaire', 'especes'],
        required: true
    },

    // Détails destinataire
    destinataire: {
        nom: String,
        telephone: String,
        rib: String,
        banque: String
    },

    // Référence externe (n° virement, ID MoMo)
    referenceExterne: {
        type: String,
        required: true
    },

    // Notes/commentaires
    notes: String,

    // Statut
    statut: {
        type: String,
        enum: ['planifie', 'effectue', 'annule', 'echec'],
        default: 'effectue'
    },

    // PDF du relevé
    relevePdfPath: String,

    // Dates
    dateReversement: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

reversementSchema.index({ hotel: 1, createdAt: -1 });
reversementSchema.index({ proprietaire: 1, createdAt: -1 });

module.exports = mongoose.model('Reversement', reversementSchema);