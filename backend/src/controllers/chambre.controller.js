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
        
        // ✅ Images : URL complète
        if (req.files?.length > 0) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            req.body.images = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
        }
        
        // Convertir types
        if (req.body.prixParNuit) req.body.prixParNuit = parseFloat(req.body.prixParNuit);
        if (req.body.maxPersonnes) req.body.maxPersonnes = parseInt(req.body.maxPersonnes);
        if (req.body.superficie) req.body.superficie = parseFloat(req.body.superficie);
        if (req.body.quantiteTotale) req.body.quantiteTotale = parseInt(req.body.quantiteTotale);
        if (req.body.quantiteDisponible) req.body.quantiteDisponible = parseInt(req.body.quantiteDisponible);
        
        console.log("🛏️ Data chambre:", req.body);
        
        const chambre = await Chambre.create(req.body);
        successResponse(res, { chambre }, 'Chambre creee', 201);
    } catch (error) {
        console.error("❌ Erreur createChambre:", error);
        next(error);
    }
};

exports.updateChambre = async (req, res, next) => {
    try {
        console.log("📥 Update chambre - Body:", req.body);
        console.log("📥 Update chambre - Files:", req.files?.length || 0);
        
        let chambre = await Chambre.findById(req.params.id);
        if (!chambre) return errorResponse(res, 'Chambre non trouvee', 404);
        
        const hotel = await Hotel.findById(chambre.hotel);
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        
        // ============ GESTION DES IMAGES ============
        let finalImages = [];

        if (req.body.existingImages) {
            try {
                const parsed = typeof req.body.existingImages === 'string' 
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
                finalImages = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                finalImages = chambre.images || [];
            }
        } else {
            finalImages = [...(chambre.images || [])];
        }

        // Ajouter les nouvelles images
        if (req.files?.length > 0) {
            for (const file of req.files) {
                finalImages.push(`${baseUrl}/uploads/${file.filename}`);
            }
        }

        // ============ PRÉPARER DATA ============
        const updateData = {};
        const simpleFields = ['nom', 'type', 'description', 'devise', 'typeLit'];
        simpleFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== '') {
                updateData[field] = req.body[field];
            }
        });

        // Nombres
        if (req.body.prixParNuit) updateData.prixParNuit = parseFloat(req.body.prixParNuit);
        if (req.body.maxPersonnes) updateData.maxPersonnes = parseInt(req.body.maxPersonnes);
        if (req.body.superficie) updateData.superficie = parseFloat(req.body.superficie);
        if (req.body.quantiteTotale) updateData.quantiteTotale = parseInt(req.body.quantiteTotale);
        if (req.body.quantiteDisponible !== undefined) {
            updateData.quantiteDisponible = parseInt(req.body.quantiteDisponible);
        }

        // Images
        updateData.images = finalImages;

        console.log("📝 Update data chambre:", updateData);
        
        chambre = await Chambre.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        console.log("✅ Chambre mise à jour");
        successResponse(res, { chambre }, 'Chambre mise a jour');
    } catch (error) {
        console.error("❌ Erreur updateChambre:", error);
        next(error);
    }
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