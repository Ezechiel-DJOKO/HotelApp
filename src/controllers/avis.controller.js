const Avis = require('../model/Avis');
const Reservation = require('../model/Reservations');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.createAvis = async (req, res, next) => {
    try {
        // Verifier que l'utilisateur a sejourne dans cet hotel
        const aSejourne = await Reservation.findOne({
            utilisateur: req.utilisateur._id,
            hotel: req.params.hotelId,
            statut: 'terminee',
            dateDepart: { $lt: new Date() }
        });
        
        if (!aSejourne) {
            return errorResponse(res, 'Vous devez avoir sejourne dans cet hotel pour laisser un avis', 403);
        }
        
        // Verifier qu'il n'a pas deja laisse un avis
        const avisExistant = await Avis.findOne({
            utilisateur: req.utilisateur._id,
            hotel: req.params.hotelId
        });
        if (avisExistant) {
            return errorResponse(res, 'Vous avez deja laisse un avis pour cet hotel', 400);
        }
        
        req.body.utilisateur = req.utilisateur._id;
        req.body.hotel = req.params.hotelId;
        const avis = await Avis.create(req.body);
        successResponse(res, { avis }, 'Avis ajoute', 201);
    } catch (error) { next(error); }
};

exports.getAvisHotel = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        
        const avis = await Avis.find({ hotel: req.params.hotelId })
            .populate('utilisateur', 'nom prenom avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));
            
        const total = await Avis.countDocuments({ hotel: req.params.hotelId });
        
        successResponse(res, { 
            avis, 
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        }, 'Avis recuperes');
    } catch (error) { next(error); }
};