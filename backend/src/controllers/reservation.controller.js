const Reservation = require('../model/Reservations');
const Chambre = require('../model/Chambre');
const Hotel = require('../model/Hotel');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.createReservation = async (req, res, next) => {
    try {
        const { chambreId, dateArrivee, dateDepart, voyageurs, demandesSpeciales, contact } = req.body;
        
        const chambre = await Chambre.findById(chambreId);
        if (!chambre) return errorResponse(res, 'Chambre non trouvee', 404);
        if (!chambre.estDisponible || chambre.quantiteDisponible <= 0) {
            return errorResponse(res, 'Cette chambre n\'est plus disponible', 400);
        }

        const arrivee = new Date(dateArrivee);
        const depart = new Date(dateDepart);
        const nuits = Math.ceil((depart - arrivee) / (1000 * 60 * 60 * 24));
        if (nuits <= 0) return errorResponse(res, 'Dates invalides', 400);

        const reservationsCount = await Reservation.countDocuments({
            chambre: chambreId,
            statut: { $nin: ['annulee'] },
            $or: [
                { dateArrivee: { $lte: arrivee }, dateDepart: { $gte: arrivee } },
                { dateArrivee: { $lte: depart }, dateDepart: { $gte: depart } },
                { dateArrivee: { $gte: arrivee }, dateDepart: { $lte: depart } }
            ]
        });
        
        if (reservationsCount >= chambre.quantiteTotale) {
            return errorResponse(res, 'Cette chambre est deja reservee aux dates selectionnees', 409);
        }

        const prixTotal = chambre.prixParNuit * nuits;

        const reservation = await Reservation.create({
            utilisateur: req.utilisateur._id,
            hotel: chambre.hotel,
            chambre: chambreId,
            dateArrivee: arrivee,
            dateDepart: depart,
            voyageurs,
            prixTotal,
            demandesSpeciales,
            contact,
        });
        
        chambre.quantiteDisponible = Math.max(0, chambre.quantiteTotale - reservationsCount - 1);
        if (chambre.quantiteDisponible <= 0) chambre.estDisponible = false;
        await chambre.save();

        successResponse(res, { reservation }, 'Reservation creee', 201);
    } catch (error) { next(error); }
};

exports.getMesReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find({ utilisateur: req.utilisateur._id })
            .populate('hotel', 'nom images slug')
            .populate('chambre', 'nom type')
            .sort('-createdAt');
        successResponse(res, { reservations }, 'Mes reservations');
    } catch (error) { next(error); }
};

exports.getReservationsHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        if (req.utilisateur.role !== 'admin' && hotel.proprietaire.toString() !== req.utilisateur._id.toString()) {
            return errorResponse(res, 'Non autorise', 403);
        }
        const reservations = await Reservation.find({ hotel: req.params.hotelId })
            .populate('utilisateur', 'nom prenom email telephone')
            .populate('chambre', 'nom type')
            .sort('-createdAt');
        successResponse(res, { reservations }, 'Reservations de l\'hotel');
    } catch (error) { next(error); }
};

exports.updateStatut = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) return errorResponse(res, 'Reservation non trouvee', 404);
        
        // CORRECTION SECURITE : verifier que le proprietaire est celui de l'hotel
        const hotel = await Hotel.findById(reservation.hotel);
        if (req.utilisateur.role !== 'admin' && 
            hotel.proprietaire.toString() !== req.utilisateur._id.toString()) {
            return errorResponse(res, 'Non autorise', 403);
        }
        
        const oldStatus = reservation.statut;
        reservation.statut = req.body.statut;
        await reservation.save();
        
        if (req.body.statut === 'annulee' && oldStatus !== 'annulee') {
            const chambre = await Chambre.findById(reservation.chambre);
            if (chambre) {
                chambre.quantiteDisponible = Math.min(chambre.quantiteDisponible + 1, chambre.quantiteTotale);
                chambre.estDisponible = true;
                await chambre.save();
            }
        }
        
        successResponse(res, { reservation }, 'Statut mis a jour');
    } catch (error) { next(error); }
};