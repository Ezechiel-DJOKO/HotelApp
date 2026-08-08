const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    // Références
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true
    },
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    
    // Numéro unique de transaction
    numeroTransaction: {
        type: String,
        unique: true,
        required: true
    },
    
    // Montants (en XOF)
    montantTotal: {
        type: Number,
        required: true
    },
    tauxCommission: {
        type: Number,
        required: true
    },
    montantCommission: {
        type: Number,
        required: true
    },
    montantHotel: {
        type: Number,
        required: true
    },
    devise: {
        type: String,
        default: 'XOF'
    },
    
    // Méthode de paiement
    methode: {
        type: String,
        enum: ['mtn_momo', 'moov_money', 'orange_money', 'wave', 'carte_visa', 'carte_mastercard', 'demo'],
        required: true
    },
    
    // Téléphone (pour MoMo) ou infos carte
    telephonePayeur: String,
    
    // Statut
    statut: {
        type: String,
        enum: ['en_attente', 'reussi', 'echoue', 'rembourse'],
        default: 'en_attente'
    },
    
    // Référence externe (CinetPay)
    referenceExterne: String,
    donneesExternes: Object,
    
    // Reçu
    numeroReçu: String,
    receiptPdfPath: String,
    qrCodeData: String,
    
    // Statut du reversement à l'hôtel
    reverse: {
        type: Boolean,
        default: false
    },
    dateReversement: Date,
    reversementRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reversement'
    },
    
    // Erreur si échoué
    erreur: String,
    
    // Dates
    datePaiement: Date
}, {
    timestamps: true
});

// Index pour recherches rapides
transactionSchema.index({ utilisateur: 1, createdAt: -1 });
transactionSchema.index({ hotel: 1, createdAt: -1 });
transactionSchema.index({ statut: 1, reverse: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);