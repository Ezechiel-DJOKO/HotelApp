const jwt = require('jsonwebtoken');
const Utilisateur = require('../model/User');
const { errorResponse } = require('../util/apiResponse');

exports.protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.utilisateur = await Utilisateur.findById(decoded.id).select('-password');
            if (!req.utilisateur) {
                return errorResponse(res, 'Utilisateur non trouvé', 401);
            }
            next();
        } catch (error) {
            return errorResponse(res, 'Non autorisé, token invalide', 401);
        }
    }
    if (!token) {
        return errorResponse(res, 'Non autorisé, pas de token', 401);
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.utilisateur.role)) {
            return errorResponse(res, 'Accès interdit pour ce rôle', 403);
        }
        next();
    };
};