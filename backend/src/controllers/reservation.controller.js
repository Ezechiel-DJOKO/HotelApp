const Reservation = require('../model/Reservations');
const Chambre = require('../model/Chambre');
const Hotel = require('../model/Hotel');
const { createNotification } = require('../util/notificationService');
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

        // ✅ NOTIFICATION à l'owner
        try {
            const hotelDetails = await Hotel.findById(chambre.hotel);
            if (hotelDetails) {
                await createNotification({
                    utilisateurId: hotelDetails.proprietaire,
                    type: 'nouvelle_reservation',
                    titre: '🆕 Nouvelle réservation !',
                    message: `${req.utilisateur.prenom} ${req.utilisateur.nom} a réservé "${chambre.nom}" pour ${nuits} nuit${nuits > 1 ? 's' : ''}`,
                    icone: 'Calendar',
                    couleur: 'blue',
                    lien: `/owner/reservations/${reservation._id}`,
                    data: { reservationId: reservation._id.toString() }
                });
            }
        } catch (notifErr) {
            console.error('⚠️ Erreur notif (non bloquant):', notifErr.message);
        }

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
        
        const hotel = await Hotel.findById(reservation.hotel);
        if (req.utilisateur.role !== 'admin' && 
            hotel.proprietaire.toString() !== req.utilisateur._id.toString()) {
            return errorResponse(res, 'Non autorise', 403);
        }

        const nouveauStatut = req.body.statut;
        const oldStatus = reservation.statut;

        // ✅ Vérifier "terminée" seulement après date de départ
        if (nouveauStatut === 'terminee') {
            const maintenant = new Date();
            const dateDepart = new Date(reservation.dateDepart);
            
            if (maintenant < dateDepart) {
                const joursRestants = Math.ceil(
                    (dateDepart - maintenant) / (1000 * 60 * 60 * 24)
                );
                return errorResponse(
                    res, 
                    `Impossible de marquer terminée avant la date de départ (${dateDepart.toLocaleDateString('fr-FR')}). Encore ${joursRestants} jour(s) à attendre.`, 
                    400
                );
            }
        }

        // ✅ Vérification : "confirmée" nécessite d'être "payée" d'abord
        if (nouveauStatut === 'confirmee' && oldStatus !== 'payee' && oldStatus !== 'en_attente') {
            return errorResponse(
                res, 
                'La réservation doit être payée avant d\'être confirmée.', 
                400
            );
        }

        // ✅ Vérification : "terminée" nécessite d'être "confirmée" d'abord
        if (nouveauStatut === 'terminee' && oldStatus !== 'confirmee') {
            return errorResponse(
                res, 
                'La réservation doit être confirmée avant d\'être marquée terminée.', 
                400
            );
        }
        
        reservation.statut = nouveauStatut;
        await reservation.save();
        
        // Libérer la chambre si annulée
        if (nouveauStatut === 'annulee' && oldStatus !== 'annulee') {
            const chambre = await Chambre.findById(reservation.chambre);
            if (chambre) {
                chambre.quantiteDisponible = Math.min(chambre.quantiteDisponible + 1, chambre.quantiteTotale);
                chambre.estDisponible = true;
                await chambre.save();
            }
        }

        // ✅ NOTIFICATIONS au client
        try {
            if (nouveauStatut === 'confirmee' && oldStatus !== 'confirmee') {
                await createNotification({
                    utilisateurId: reservation.utilisateur,
                    type: 'reservation_confirmee',
                    titre: '✅ Réservation confirmée !',
                    message: 'Votre réservation a été confirmée par l\'hôtelier. Bon séjour !',
                    icone: 'CheckCircle',
                    couleur: 'green',
                    lien: `/client/reservations/${reservation._id}`
                });
            } else if (nouveauStatut === 'annulee' && oldStatus !== 'annulee') {
                await createNotification({
                    utilisateurId: reservation.utilisateur,
                    type: 'reservation_annulee',
                    titre: '❌ Réservation annulée',
                    message: 'Votre réservation a été annulée.',
                    icone: 'XCircle',
                    couleur: 'red',
                    lien: `/client/reservations/${reservation._id}`
                });
            } else if (nouveauStatut === 'terminee' && oldStatus !== 'terminee') {
                await createNotification({
                    utilisateurId: reservation.utilisateur,
                    type: 'reservation_terminee',
                    titre: '⭐ Séjour terminé',
                    message: 'Merci pour votre séjour ! N\'oubliez pas de laisser un avis.',
                    icone: 'Star',
                    couleur: 'yellow',
                    lien: `/client/reservations/${reservation._id}`
                });
            }
        } catch (notifErr) {
            console.error('⚠️ Erreur notif (non bloquant):', notifErr.message);
        }
        
        successResponse(res, { reservation }, `Statut mis à jour : ${nouveauStatut}`);
    } catch (error) {
        console.error('❌ Erreur updateStatut:', error);
        next(error);
    }
};