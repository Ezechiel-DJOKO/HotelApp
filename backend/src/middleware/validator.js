const Joi = require('joi');

// --- Auth ---
exports.validateInscription = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        password_confirm: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Les mots de passe ne correspondent pas'
        }),
        nom: Joi.string().min(2).max(50).required(),
        prenom: Joi.string().min(2).max(50).required(),
        phone: Joi.string().allow('', null)
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

exports.validateConnexion = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

exports.validateOTP = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        otpCode: Joi.string().length(6).pattern(/^\d+$/).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

exports.validateForgotPassword = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

exports.validateResetPassword = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
        newPassword: Joi.string().min(6).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

exports.validateChangePassword = (req, res, next) => {
    const schema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

// --- Hotels ---
exports.validateHotel = (req, res, next) => {
    const schema = Joi.object({
        nom: Joi.string().min(3).max(100).required(),
        description: Joi.string().min(10).required(),
        type: Joi.string().valid('hotel', 'auberge', 'residence', 'guesthouse', 'camping', 'appartement').required(),
        etoiles: Joi.number().integer().min(1).max(5),
        adresse: Joi.string().required(),
        ville: Joi.string().valid(
            'Cotonou', 'Porto-Novo', 'Parakou', 'Abomey', 'Bohicon',
            'Natitingou', 'Kandi', 'Ouidah', 'Lokossa', 'Dogbo',
            'Savalou', 'Sakete', 'Comme', 'Allada', 'Abomey-Calavi'
        ).required(),
        email: Joi.string().email().allow('', null),
        telephone: Joi.string().required(),
        siteWeb: Joi.string().uri().allow('', null),
        equipements: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional(),
        fourchettePrix: Joi.object({
            min: Joi.number().min(0),
            max: Joi.number().min(0),
            devise: Joi.string().default('XOF')
        }).optional(),
        'fourchettePrix[min]': Joi.number().min(0).optional(),
        'fourchettePrix[max]': Joi.number().min(0).optional(),
        politiques: Joi.object({
            checkIn: Joi.string(),
            checkOut: Joi.string(),
            annulation: Joi.string(),
            animauxAcceptes: Joi.boolean()
        }).optional(),
        localisation: Joi.object({
            type: Joi.string().valid('Point').default('Point'),
            coordinates: Joi.array().items(Joi.number()).length(2)
        }).optional(),
        // ✅ Champs autorisés supplémentaires
        images: Joi.any().optional(),
        existingImages: Joi.any().optional(),
        estVerifie: Joi.any().optional(),
        estActif: Joi.any().optional()
    }).unknown(true); // ✅ TRÈS IMPORTANT : autorise les champs inconnus
    
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

// --- Chambres ---
exports.validateChambre = (req, res, next) => {
    const schema = Joi.object({
        nom: Joi.string().required(),
        type: Joi.string().valid('simple', 'double', 'twin', 'triple', 'suite', 'familiale', 'vip', 'presidentielle').required(),
        description: Joi.string().allow('', null),
        prixParNuit: Joi.number().positive().required(),
        devise: Joi.string().default('XOF'),
        maxPersonnes: Joi.number().integer().min(1).required(),
        superficie: Joi.number().positive(),
        typeLit: Joi.string(),
        equipements: Joi.array().items(Joi.string()),
        quantiteTotale: Joi.number().integer().min(1).default(1),
        quantiteDisponible: Joi.number().integer().min(0)
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

// --- Reservations ---
exports.validateReservation = (req, res, next) => {
    const schema = Joi.object({
        chambreId: Joi.string().hex().length(24).required(),
        dateArrivee: Joi.date().greater('now').required(),
        dateDepart: Joi.date().greater(Joi.ref('dateArrivee')).required(),
        voyageurs: Joi.object({
            adultes: Joi.number().integer().min(1).default(1),
            enfants: Joi.number().integer().min(0).default(0)
        }),
        demandesSpeciales: Joi.string().allow('', null),
        contact: Joi.object({
            nom: Joi.string(),
            email: Joi.string().email(),
            telephone: Joi.string()
        })
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};

// --- Avis ---
exports.validateAvis = (req, res, next) => {
    const schema = Joi.object({
        note: Joi.number().integer().min(1).max(5).required(),
        titre: Joi.string().max(100).allow('', null),
        commentaire: Joi.string().min(5).max(2000).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    next();
};