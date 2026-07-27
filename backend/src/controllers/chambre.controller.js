const Chambre = require('../model/Chambre');
const Hotel = require('../model/Hotel');
const Reservation = require('../model/Reservations');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.getChambres = async (req, res, next) => {
    try {
        const chambres = await Chambre.find({ hotel: req.params.hotelId });
        successResponse(res, { chambres }, 'Chambres recuperees');
    } catch (error) { next(error); }
};

exports.checkDisponibilite = async (req, res, next) => {
    try {
        const { dateArrivee, dateDepart } = req.query;
        if (!dateArrivee || !dateDepart) {
            return errorResponse(res, 'Dates requises (dateArrivee, dateDepart)', 400);
        }
        
        const arrivee = new Date(dateArrivee);
        const depart = new Date(dateDepart);
        if (arrivee >= depart) return errorResponse(res, 'dateDepart doit etre apres dateArrivee', 400);
        
        const chambres = await Chambre.find({ hotel: req.params.hotelId, estDisponible: true });
        
        const disponibles = [];
        for (const chambre of chambres) {
            const reservationsCount = await Reservation.countDocuments({
                chambre: chambre._id,
                statut: { $nin: ['annulee'] },
                $or: [
                    { dateArrivee: { $lte: arrivee }, dateDepart: { $gte: arrivee } },
                    { dateArrivee: { $lte: depart }, dateDepart: { $gte: depart } },
                    { dateArrivee: { $gte: arrivee }, dateDepart: { $lte: depart } }
                ]
            });
            
            const placesRestantes = chambre.quantiteTotale - reservationsCount;
            if (placesRestantes > 0) {
                disponibles.push({
                    ...chambre.toObject(),
                    placesRestantes
                });
            }
        }
        
        successResponse(res, { chambres: disponibles, count: disponibles.length }, 'Disponibilite verifiee');
    } catch (error) { next(error); }
};

exports.createChambre = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }
        req.body.hotel = req.params.hotelId;
        if (req.files) req.body.images = req.files.map(f => f.path);
        const chambre = await Chambre.create(req.body);
        successResponse(res, { chambre }, 'Chambre creee', 201);
    } catch (error) { next(error); }
};

exports.updateChambre = async (req, res, next) => {
    try {
        let chambre = await Chambre.findById(req.params.id);
        if (!chambre) return errorResponse(res, 'Chambre non trouvee', 404);
        const hotel = await Hotel.findById(chambre.hotel);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }
        chambre = await Chambre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        successResponse(res, { chambre }, 'Chambre mise a jour');
    } catch (error) { next(error); }
};

exports.deleteChambre = async (req, res, next) => {
    try {
        const chambre = await Chambre.findById(req.params.id);
        if (!chambre) return errorResponse(res, 'Chambre non trouvee', 404);
        const hotel = await Hotel.findById(chambre.hotel);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }
        await chambre.deleteOne();
        successResponse(res, {}, 'Chambre supprimee');
    } catch (error) { next(error); }
};