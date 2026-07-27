const Hotel = require('../model/Hotel');
const Chambre = require('../model/Chambre');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.getHotels = async (req, res, next) => {
    try {
        const { ville, type, minPrix, maxPrix, etoiles, equipements, page = 1, limit = 10, lat, lng, rayon = 10000, sortBy } = req.query;
        let query = { estActif: true };

        if (ville) query.ville = ville;
        if (type) query.type = type;
        if (etoiles) query.etoiles = Number(etoiles);
        if (equipements) query.equipements = { $in: equipements.split(',') };
        
        // CORRECTION BUG PRIX
        if (minPrix) {
            query['fourchettePrix.min'] = { $gte: Number(minPrix) };
        }
        if (maxPrix) {
            query['fourchettePrix.max'] = { $lte: Number(maxPrix) };
        }

        if (lat && lng) {
            query.localisation = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(rayon),
                },
            };
        }

        const sortOptions = {};
        if (sortBy) {
            const [field, order] = sortBy.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        const skip = (Number(page) - 1) * Number(limit);
        const hotels = await Hotel.find(query)
            .populate('proprietaire', 'nom prenom email telephone')
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit));

        const total = await Hotel.countDocuments(query);
        successResponse(res, {
            hotels,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
        }, 'Liste des hotels recuperee');
    } catch (error) { next(error); }
};

exports.getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findOne({ slug: req.params.slug })
            .populate('proprietaire', 'nom prenom email telephone')
            .populate('chambres');
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        successResponse(res, { hotel }, 'Hotel recupere');
    } catch (error) { next(error); }
};

exports.createHotel = async (req, res, next) => {
    try {
        req.body.proprietaire = req.utilisateur._id;
        if (req.files) req.body.images = req.files.map(f => f.path);
        const hotel = await Hotel.create(req.body);
        successResponse(res, { hotel }, 'Hotel cree avec succes', 201);
    } catch (error) { next(error); }
};

exports.updateHotel = async (req, res, next) => {
    try {
        let hotel = await Hotel.findById(req.params.id);
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }
        if (req.files?.length > 0) req.body.images = req.files.map(f => f.path);
        hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        successResponse(res, { hotel }, 'Hotel mis a jour');
    } catch (error) { next(error); }
};

exports.deleteHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }
        // Suppression en cascade des chambres
        await Chambre.deleteMany({ hotel: req.params.id });
        await hotel.deleteOne();
        successResponse(res, {}, 'Hotel et ses chambres supprimes');
    } catch (error) { next(error); }
};

exports.getVilles = async (req, res, next) => {
    try {
        const villes = await Hotel.distinct('ville');
        successResponse(res, { villes }, 'Villes recuperees');
    } catch (error) { next(error); }
};

exports.getMesHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find({ proprietaire: req.utilisateur._id })
            .populate('chambres');
        successResponse(res, { hotels, count: hotels.length }, 'Mes hotels recuperees');
    } catch (error) { next(error); }
};