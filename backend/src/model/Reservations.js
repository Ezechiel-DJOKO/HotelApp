const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    chambre: { type: mongoose.Schema.Types.ObjectId, ref: 'Chambre', required: true },
    dateArrivee: { type: Date, required: true },
    dateDepart: { type: Date, required: true },
    voyageurs: {
        adultes: { type: Number, required: true, default: 1 },
        enfants: { type: Number, default: 0 },
    },
    prixTotal: { type: Number, required: true },
    statut: {
        type: String,
        enum: ['en_attente', 'payee', 'confirmee', 'annulee', 'terminee'],
        default: 'en_attente'
    },
    demandesSpeciales: String,
    contact: {
        nom: String,
        email: String,
        telephone: String,
    },
    motifAnnulation: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);