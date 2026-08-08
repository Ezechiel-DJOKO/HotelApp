const mongoose = require('mongoose');

const opportuniteSchema = new mongoose.Schema({
    // Qui fait la demande
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },

    // Type d'opportunité
    type: {
        type: String,
        enum: ['proprietaire', 'partenaire', 'construction'],
        required: true
    },

    // Hôtel ciblé (pour proprietaire et partenaire)
    hotelCible: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        default: null
    },

    // Si l'hôtel n'est pas sur la plateforme
    hotelExterne: {
        nom: String,
        ville: String,
        adresse: String,
        description: String,
        telephone: String,
        email: String
    },

    // ============ INFOS PROPRIÉTAIRE ============
    typeGestion: {
        type: String,
        enum: ['rachat', 'gerance', 'copropriete', 'franchise', null],
        default: null
    },

    // ============ INFOS PARTENAIRE ============
    typePartenariat: {
        type: String,
        enum: ['sponsor', 'investisseur', 'commercial', 'technique', null],
        default: null
    },
    montantInvestissement: {
        type: Number,
        default: 0
    },
    dureePartenariat: {
        type: String,
        default: ''
    },

    // ============ INFOS CONSTRUCTION ============
    nomProjet: {
        type: String,
        default: ''
    },
    villeSouhaitee: {
        type: String,
        default: ''
    },
    typeHebergement: {
        type: String,
        enum: ['hotel', 'auberge', 'residence', 'guesthouse', 'camping', 'appartement', null],
        default: null
    },
    nombreChambresPrevu: {
        type: Number,
        default: 0
    },
    terrainAcquis: {
        type: Boolean,
        default: false
    },

    // ============ COMMUN ============
    budgetEstime: {
        type: Number,
        default: 0
    },
    devise: {
        type: String,
        default: 'XOF'
    },

    motivation: {
        type: String,
        required: [true, 'La motivation est requise']
    },
    experience: {
        type: String,
        default: ''
    },
    descriptionProjet: {
        type: String,
        default: ''
    },

    // Documents
    documents: {
        pieceIdentite: String,
        preuveFonds: String,
        businessPlan: String,
        rccm: String,
        preuveProriete: String,
        autres: [{
            nom: String,
            url: String
        }]
    },

    // Contact préféré
    contactPrefere: {
        type: String,
        enum: ['email', 'telephone', 'whatsapp'],
        default: 'email'
    },
    telephoneContact: String,

    // Statut
    statut: {
        type: String,
        enum: ['en_attente', 'en_cours', 'approuvee', 'refusee', 'terminee'],
        default: 'en_attente'
    },

    // Traitement admin
    traitePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    },
    dateTraitement: Date,
    motifRefus: String,
    notesAdmin: String,

    // Priorité
    priorite: {
        type: String,
        enum: ['basse', 'normale', 'haute', 'urgente'],
        default: 'normale'
    }
}, {
    timestamps: true
});

opportuniteSchema.index({ utilisateur: 1, type: 1, createdAt: -1 });
opportuniteSchema.index({ statut: 1, type: 1 });

module.exports = mongoose.model('Opportunite', opportuniteSchema);