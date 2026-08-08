const mongoose = require('mongoose');

const demandeProprietaireSchema = new mongoose.Schema({
    // Utilisateur qui fait la demande
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: true
    },
    
    // Infos hôtel prévu
    nomHotel: {
        type: String,
        required: [true, 'Le nom de l\'hôtel est requis'],
        trim: true
    },
    typeHotel: {
        type: String,
        enum: ['hotel', 'auberge', 'residence', 'guesthouse', 'camping', 'appartement'],
        required: true
    },
    ville: {
        type: String,
        required: true,
        enum: [
            'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Bohicon',
            'Natitingou', 'Kandi', 'Ouidah', 'Lokossa', 'Dogbo',
            'Savalou', 'Sakete', 'Comme', 'Allada', 'Abomey-Calavi'
        ]
    },
    adresse: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        minlength: [50, 'La description doit contenir au moins 50 caractères']
    },
    telephoneHotel: {
        type: String,
        required: true
    },
    emailHotel: {
        type: String
    },
    nombreChambres: {
        type: Number,
        default: 0
    },
    
    // Documents (URLs des fichiers uploadés)
    documents: {
        pieceIdentite: {
            type: String, // URL du fichier
            required: true
        },
        rccm: {
            type: String // URL du fichier (facultatif)
        },
        autres: [{
            nom: String,
            url: String
        }]
    },
    
    // Motivation
    motivation: {
        type: String,
        required: [true, 'La motivation est requise'],
        minlength: [50, 'La motivation doit contenir au moins 50 caractères']
    },
    experience: {
        type: String,
        default: ''
    },
    
    // Statut de la demande
    statut: {
        type: String,
        enum: ['en_attente', 'approuvee', 'refusee'],
        default: 'en_attente'
    },
    
    // Traitement par admin
    traitePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur'
    },
    dateTraitement: {
        type: Date
    },
    motifRefus: {
        type: String
    },
    notesAdmin: {
        type: String
    }
}, {
    timestamps: true
});

// Un utilisateur ne peut avoir qu'une seule demande en attente
demandeProprietaireSchema.index(
    { utilisateur: 1, statut: 1 },
    { unique: true, partialFilterExpression: { statut: 'en_attente' } }
);

module.exports = mongoose.model('DemandeProprietaire', demandeProprietaireSchema);