const Utilisateur = require('../model/User');
const Hotel = require('../model/Hotel');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.getProfil = async (req, res, next) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur._id);
        successResponse(res, { utilisateur }, 'Profil recupere');
    } catch (error) { next(error); }
};

exports.updateProfil = async (req, res, next) => {
    try {
        const champsInterdits = ['password', 'role', 'isAdmin', 'isActive', 'isVerified', 'otpCode', 'resetOtp'];
        champsInterdits.forEach(c => delete req.body[c]);
        
        const utilisateur = await Utilisateur.findByIdAndUpdate(
            req.utilisateur._id,
            req.body,
            { new: true, runValidators: true }
        );
        successResponse(res, { utilisateur }, 'Profil mis a jour');
    } catch (error) { next(error); }
};

exports.uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) return errorResponse(res, 'Aucune image fournie', 400);
        const utilisateur = await Utilisateur.findByIdAndUpdate(
            req.utilisateur._id,
            { avatar: req.file.path },
            { new: true }
        );
        successResponse(res, { utilisateur }, 'Avatar mis a jour');
    } catch (error) { next(error); }
};

exports.devenirProprietaire = async (req, res, next) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur._id);
        if (utilisateur.role !== 'user') {
            return errorResponse(res, 'Vous etes deja proprietaire ou admin', 400);
        }
        utilisateur.role = 'owner';
        await utilisateur.save();
        successResponse(res, { utilisateur }, 'Vous etes maintenant proprietaire');
    } catch (error) { next(error); }
};

exports.getMesHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find({ proprietaire: req.utilisateur._id })
            .populate('chambres');
        successResponse(res, { hotels, count: hotels.length }, 'Mes hotels recuperes');
    } catch (error) { next(error); }
};

exports.supprimerCompte = async (req, res, next) => {
    try {
        await Utilisateur.findByIdAndDelete(req.utilisateur._id);
        successResponse(res, {}, 'Compte supprime');
    } catch (error) { next(error); }
};