const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const utilisateurSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "L'email est obligatoire"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Le mot de passe est obligatoire"],
        minlength: [6, "le mot de passe doit faire au moins 6 caractères"],
        select: false
    },
    prenom: {
        type: String,
        required: [true, "Le prénom est obligatoire"],
        trim: true
    },
    nom: {
        type: String,
        required: [true, "Le nom est obligatoire"],
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    otpCode: {
        type: String,
        default: null,
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    resetOtp: {
        type: String,
        default: null
    },
    resetOtpExpiresAt: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour le nom complet
utilisateurSchema.virtual('nomComplet').get(function () {
    return `${this.nom} ${this.prenom}`.trim();
});

// Hash du mot de passe avant sauvegarde
utilisateurSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Synchroniser isAdmin avec role
utilisateurSchema.pre('save', function (next) {
    if (this.isModified('role')) {
        this.isAdmin = this.role === 'admin';
    }
    if (this.isModified('isAdmin')) {
        if (this.isAdmin && this.role !== 'admin') this.role = 'admin';
    }
    next();
});

// Méthode pour comparer les mots de passe
utilisateurSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer OTP
utilisateurSchema.methods.generateOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpCode = otp;
    this.otpExpiresAt = Date.now() + 10 * 60 * 1000;
    return otp;
};

// Méthode pour vérifier OTP
utilisateurSchema.methods.verifyOTP = function (code) {
    if (!this.otpCode || !this.otpExpiresAt) return false;
    if (Date.now() > this.otpExpiresAt) return false;
    if (this.otpCode === code) {
        this.isActive = true;
        this.isVerified = true;
        this.otpCode = null;
        this.otpExpiresAt = null;
        return true;
    }
    return false;
};

// Méthode pour générer le reset OTP
utilisateurSchema.methods.generateResetOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.resetOtp = otp;
    this.resetOtpExpiresAt = Date.now() + 10 * 60 * 1000;
    return otp;
};

// Méthode pour vérifier le OTP reset
utilisateurSchema.methods.verifyResetOTP = function (code) {
    if (!this.resetOtp || !this.resetOtpExpiresAt) return false;
    if (Date.now() > this.resetOtpExpiresAt) return false;
    return this.resetOtp === code;
};

// Méthode pour nettoyer OTP reset
utilisateurSchema.methods.clearResetOTP = function () {
    this.resetOtp = null;
    this.resetOtpExpiresAt = null;
};

module.exports = mongoose.model('Utilisateur', utilisateurSchema);