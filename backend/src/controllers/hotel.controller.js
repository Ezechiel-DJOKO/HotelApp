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
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        
        req.body.proprietaire = req.utilisateur._id;
        
        if (req.files?.length > 0) {
            req.body.images = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
        }

        if (req.body.etoiles) req.body.etoiles = parseInt(req.body.etoiles);
        
        // Gérer les 2 formats de fourchettePrix
        let prixMinRaw, prixMaxRaw;
        if (req.body.fourchettePrix && typeof req.body.fourchettePrix === 'object') {
            prixMinRaw = req.body.fourchettePrix.min;
            prixMaxRaw = req.body.fourchettePrix.max;
        } else {
            prixMinRaw = req.body['fourchettePrix[min]'];
            prixMaxRaw = req.body['fourchettePrix[max]'];
        }

        if (prixMinRaw !== undefined || prixMaxRaw !== undefined) {
            req.body.fourchettePrix = {
                min: parseInt(prixMinRaw) || 0,
                max: parseInt(prixMaxRaw) || 0,
                devise: 'XOF'
            };
            delete req.body['fourchettePrix[min]'];
            delete req.body['fourchettePrix[max]'];
        }

        const hotel = await Hotel.create(req.body);
        successResponse(res, { hotel }, 'Hotel cree avec succes', 201);
    } catch (error) {
        console.error("❌ Erreur createHotel:", error);
        next(error);
    }
};

exports.updateHotel = async (req, res, next) => {
    try {
        console.log("📥 Update hotel - Body brut:", req.body);
        console.log("📥 Update hotel - Files:", req.files?.length || 0);

        let hotel = await Hotel.findById(req.params.id);
        if (!hotel) return errorResponse(res, 'Hotel non trouve', 404);
        
        if (hotel.proprietaire.toString() !== req.utilisateur._id.toString() && req.utilisateur.role !== 'admin') {
            return errorResponse(res, 'Non autorise', 403);
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // ============ GESTION DES IMAGES ============
        let finalImages = [];

        if (req.body.existingImages !== undefined) {
            try {
                const parsed = typeof req.body.existingImages === 'string' 
                    ? JSON.parse(req.body.existingImages)
                    : req.body.existingImages;
                finalImages = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.warn("⚠️ Impossible de parser existingImages");
                finalImages = hotel.images || [];
            }
        } else {
            finalImages = [...(hotel.images || [])];
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                finalImages.push(`${baseUrl}/uploads/${file.filename}`);
            }
        }

        // ============ PRÉPARER LES DONNÉES ============
        const updateData = {};

        const simpleFields = ['nom', 'description', 'type', 'adresse', 'ville', 'telephone', 'email', 'siteWeb'];
        simpleFields.forEach(field => {
            if (req.body[field] !== undefined && req.body[field] !== '') {
                updateData[field] = req.body[field];
            }
        });

        if (req.body.etoiles !== undefined && req.body.etoiles !== '') {
            updateData.etoiles = parseInt(req.body.etoiles);
        }

        // ✅ FIX FOURCHETTE PRIX : gérer les 2 formats
        // Format 1 : fourchettePrix[min] (string séparé) 
        // Format 2 : fourchettePrix.min (objet imbriqué déjà parsé par Express)

        let prixMinRaw, prixMaxRaw;

        // Vérifier format objet (Express parse déjà)
        if (req.body.fourchettePrix && typeof req.body.fourchettePrix === 'object') {
            prixMinRaw = req.body.fourchettePrix.min;
            prixMaxRaw = req.body.fourchettePrix.max;
        } else {
            // Vérifier format string [key]
            prixMinRaw = req.body['fourchettePrix[min]'];
            prixMaxRaw = req.body['fourchettePrix[max]'];
        }

        console.log("💰 prixMinRaw:", prixMinRaw, "type:", typeof prixMinRaw);
        console.log("💰 prixMaxRaw:", prixMaxRaw, "type:", typeof prixMaxRaw);

        if (prixMinRaw !== undefined || prixMaxRaw !== undefined) {
            const prixMin = (prixMinRaw !== undefined && prixMinRaw !== '' && prixMinRaw !== null)
                ? parseInt(prixMinRaw) 
                : (hotel.fourchettePrix?.min || 0);
            const prixMax = (prixMaxRaw !== undefined && prixMaxRaw !== '' && prixMaxRaw !== null)
                ? parseInt(prixMaxRaw) 
                : (hotel.fourchettePrix?.max || 0);
            
            updateData.fourchettePrix = {
                min: isNaN(prixMin) ? 0 : prixMin,
                max: isNaN(prixMax) ? 0 : prixMax,
                devise: 'XOF'
            };
            console.log("💰 fourchettePrix finale:", updateData.fourchettePrix);
        }

        updateData.images = finalImages;

        if (updateData.nom) {
            const slugify = require('slugify');
            updateData.slug = slugify(updateData.nom, { lower: true, strict: true });
        }

        console.log("📝 Update data FINAL:", updateData);

        hotel = await Hotel.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        console.log("✅ Hôtel mis à jour - fourchettePrix:", hotel.fourchettePrix);
        successResponse(res, { hotel }, 'Hotel mis a jour');
    } catch (error) {
        console.error("❌ Erreur updateHotel:", error);
        next(error);
    }
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