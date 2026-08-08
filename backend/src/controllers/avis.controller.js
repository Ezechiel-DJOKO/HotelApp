const Avis = require('../model/Avis');
const Reservation = require('../model/Reservations');
const Hotel = require('../model/Hotel');
const { createNotification } = require('../util/notificationService');
const { successResponse, errorResponse } = require('../util/apiResponse');

exports.createAvis = async (req, res, next) => {
    try {
        const hotelId = req.params.hotelId;
        const utilisateurId = req.utilisateur._id;

        console.log(`🔍 Vérification avis - User: ${utilisateurId}, Hotel: ${hotelId}`);

        const aSejourne = await Reservation.findOne({
            utilisateur: utilisateurId,
            hotel: hotelId,
            statut: 'terminee'
        });

        console.log(`   Réservation trouvée:`, aSejourne ? '✅ OUI' : '❌ NON');

        if (!aSejourne) {
            return errorResponse(
                res, 
                'Vous devez avoir séjourné dans cet hôtel pour laisser un avis.', 
                403
            );
        }

        const avisExistant = await Avis.findOne({
            utilisateur: utilisateurId,
            hotel: hotelId
        });
        
        if (avisExistant) {
            return errorResponse(res, 'Vous avez déjà laissé un avis pour cet hôtel', 400);
        }

        const nouvelAvis = await Avis.create({
            utilisateur: utilisateurId,
            hotel: hotelId,
            note: req.body.note,
            titre: req.body.titre,
            commentaire: req.body.commentaire,
            estVerifie: true
        });

        // Mise à jour note moyenne
        const tousAvis = await Avis.find({ hotel: hotelId });
        const noteMoyenne = tousAvis.reduce((sum, a) => sum + a.note, 0) / tousAvis.length;
        
        await Hotel.findByIdAndUpdate(hotelId, {
            note: parseFloat(noteMoyenne.toFixed(1)),
            nombreAvis: tousAvis.length
        });

        // ✅ NOTIFICATION à l'owner
        try {
            const hotelData = await Hotel.findById(hotelId);
            if (hotelData && hotelData.proprietaire) {
                await createNotification({
                    utilisateurId: hotelData.proprietaire,
                    type: 'nouvel_avis',
                    titre: `⭐ Nouvel avis (${req.body.note}/5)`,
                    message: `${req.utilisateur.prenom} a laissé un avis sur ${hotelData.nom}`,
                    icone: 'Star',
                    couleur: req.body.note >= 4 ? 'green' : req.body.note >= 3 ? 'yellow' : 'red',
                    lien: `/hotels/${hotelData.slug}`,
                    data: { note: req.body.note }
                });
            }
        } catch (notifErr) {
            console.error('⚠️ Erreur notif avis (non bloquant):', notifErr.message);
        }

        console.log(`✅ Avis créé - Note moyenne: ${noteMoyenne.toFixed(1)}`);

        successResponse(res, { avis: nouvelAvis }, 'Avis ajouté avec succès', 201);
    } catch (error) {
        console.error('❌ Erreur createAvis:', error);
        next(error);
    }
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
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
            totalPages: Math.ceil(total / Number(limit))
        }, 'Avis récupérés');
    } catch (error) { next(error); }
};