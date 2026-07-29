const mongoose = require('mongoose');
const slugify = require('slugify');

const hotelSchema = new mongoose.Schema({
    nom: { type: String, required: [true, 'Le nom est requis'], trim: true },
    slug: String,
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['hotel', 'auberge', 'residence', 'guesthouse', 'camping', 'appartement'],
        default: 'hotel',
    },
    etoiles: { type: Number, min: 1, max: 5, default: 3 },
    adresse: { type: String, required: true },
    ville: {
        type: String,
        required: true,
        enum: [
            'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Bohicon',
            'Natitingou', 'Kandi', 'Ouidah', 'Lokossa', 'Dogbo',
            'Savalou', 'Sakete', 'Comme', 'Allada', 'Abomey-Calavi'
        ],
    },
    localisation: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            default: undefined
        },
    },
    email: String,
    telephone: { type: String, required: true },
    siteWeb: String,
    images: [String],
    equipements: [{ type: String }],
    politiques: {
        checkIn: String,
        checkOut: String,
        annulation: String,
        animauxAcceptes: { type: Boolean, default: false },
    },
    fourchettePrix: {
        min: Number,
        max: Number,
        devise: { type: String, default: 'XOF' },
    },
    note: { type: Number, min: 0, max: 5, default: 0 },
    nombreAvis: { type: Number, default: 0 },
    estVerifie: { type: Boolean, default: false },
    estActif: { type: Boolean, default: true },
    proprietaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

hotelSchema.index({ ville: 1, type: 1 });

hotelSchema.pre('save', function (next) {
    this.slug = slugify(this.nom, { lower: true });
    next();
});

hotelSchema.virtual('chambres', {
    ref: 'Chambre',
    localField: '_id',
    foreignField: 'hotel',
});
// Suppression en cascade des chambres et avis
hotelSchema.pre('deleteOne', { document: true, query: false }, async function() {
    await mongoose.model('Chambre').deleteMany({ hotel: this._id });
    await mongoose.model('Avis').deleteMany({ hotel: this._id });
    await mongoose.model('Reservation').updateMany(
        { hotel: this._id, statut: { $nin: ['annulee', 'terminee'] } },
        { statut: 'annulee' }
    );
});

module.exports = mongoose.model('Hotel', hotelSchema);