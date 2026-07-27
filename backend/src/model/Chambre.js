const mongoose = require('mongoose');

const chambreSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    nom: { type: String, required: true },
    type: {
        type: String,
        enum: ['simple', 'double', 'twin', 'triple', 'suite', 'familiale', 'vip', 'presidentielle'],
        required: true,
    },
    description: String,
    prixParNuit: { type: Number, required: true },
    devise: { type: String, default: 'XOF' },
    maxPersonnes: { type: Number, required: true },
    superficie: Number,
    typeLit: String,
    images: [String],
    equipements: [{ type: String }],
    quantiteTotale: { type: Number, required: true, default: 1 },
    quantiteDisponible: { type: Number, required: true, default: 1 },
    estDisponible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Chambre', chambreSchema);