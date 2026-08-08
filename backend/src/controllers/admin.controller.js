const Utilisateur = require('../model/User');
const Hotel = require('../model/Hotel');
const Chambre = require('../model/Chambre');
const Reservation = require('../model/Reservations');
const sendEmail = require('../util/sendEmail');
const { successResponse, errorResponse } = require('../util/apiResponse');
const slugify = require('slugify');
const { createNotification } = require('../util/notificationService');

// ============================================
// GÉNÉRATION MOT DE PASSE ALÉATOIRE
// ============================================
const generateRandomPassword = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '!';
};

// ============================================
// STATISTIQUES DASHBOARD
// ============================================
exports.getStats = async (req, res, next) => {
    try {
        const [totalClients, totalOwners, totalHotels, totalReservations, hotelsNonVerifies] = await Promise.all([
            Utilisateur.countDocuments({ role: 'user' }),
            Utilisateur.countDocuments({ role: 'owner' }),
            Hotel.countDocuments(),
            Reservation.countDocuments(),
            Hotel.countDocuments({ estVerifie: false })
        ]);

        const revenusResult = await Reservation.aggregate([
            { $match: { statut: { $in: ['confirmee', 'terminee'] } } },
            { $group: { _id: null, total: { $sum: '$prixTotal' } } }
        ]);
        const totalRevenus = revenusResult[0]?.total || 0;

        successResponse(res, {
            totalClients,
            totalOwners,
            totalHotels,
            totalReservations,
            hotelsNonVerifies,
            totalRevenus
        }, 'Statistiques récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// CRÉER HÔTEL + OWNER (ENDPOINT PRINCIPAL)
// ============================================
exports.createHotelWithOwner = async (req, res, next) => {
    console.log("📥 === DÉBUT createHotelWithOwner ===");
    console.log("📥 Body reçu:", req.body);
    console.log("📥 Nombre de fichiers:", req.files?.length || 0);

    try {
        const {
            ownerEmail,
            ownerNom,
            ownerPrenom,
            ownerPhone,
            nom,
            description,
            type,
            etoiles,
            adresse,
            ville,
            telephone,
            email
        } = req.body;

        // Validation téléphone hôtel
        if (!telephone || telephone.trim() === '') {
            return errorResponse(res, "Le numéro de téléphone de l'hôtel est obligatoire.", 400);
        }

        // ✅ VALIDATION EMAIL PROFONDE
        const { validateEmailDeep } = require('../util/emailValidator');
        const emailCheck = await validateEmailDeep(ownerEmail);
        if (!emailCheck.valid) {
            console.log(`❌ Email owner refusé : ${ownerEmail} - ${emailCheck.error}`);
            return errorResponse(res, `Email invalide : ${emailCheck.error}`, 400);
        }

        // Vérifier si l'email owner existe déjà
        const existingUser = await Utilisateur.findOne({ email: ownerEmail });
        if (existingUser) {
            return errorResponse(res, "Cet email est déjà utilisé.", 400);
        }

        // ✅ VALIDATION EMAIL avant tout
        const { validateEmail, validateEmailDomain } = require('../util/emailValidator');

        const formatCheck = validateEmail(ownerEmail);
        if (!formatCheck.valid) {
            return errorResponse(res, `Email invalide : ${formatCheck.error}`, 400);
        }

        const domainCheck = await validateEmailDomain(ownerEmail);
        if (!domainCheck.valid) {
            return errorResponse(res, `Email invalide : ${domainCheck.error}`, 400);
        }

        // Générer mot de passe
        const tempPassword = generateRandomPassword();
        console.log("🔑 Mot de passe généré:", tempPassword);

        // Créer le owner
        const owner = await Utilisateur.create({
            email: ownerEmail,
            password: tempPassword,
            nom: ownerNom,
            prenom: ownerPrenom,
            phone: ownerPhone || '',
            role: 'owner',
            isVerified: true,
            isActive: true
        });
        console.log("✅ Owner créé:", owner._id);

        // Traiter les images
        const images = [];
        if (req.files && req.files.length > 0) {
            const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
            for (const file of req.files) {
                // Stocker l'URL complète accessible depuis le frontend
                images.push(`/api/uploads/${file.filename}`);
            }
        }
        console.log("🖼️ Images URLs:", images);
        console.log("🖼️ Images traitées:", images.length);

        // Data hôtel
        const hotelData = {
            nom,
            slug: slugify(nom, { lower: true, strict: true }),
            description,
            type,
            etoiles: parseInt(etoiles),
            adresse,
            ville,
            telephone,
            email: email || undefined,
            images,
            proprietaire: owner._id,
            estVerifie: true,
            estActif: true,
            localisation: undefined,
            fourchettePrix: {
                min: parseInt(req.body['fourchettePrix[min]']) || 0,
                max: parseInt(req.body['fourchettePrix[max]']) || 0,
                devise: 'XOF'
            }
        };

        console.log("🏨 Data hôtel:", hotelData);

        // Créer l'hôtel
        let hotel;
        try {
            hotel = await Hotel.create(hotelData);
            console.log("✅ Hôtel créé:", hotel._id);
        } catch (hotelError) {
            console.error("❌ Erreur création hôtel:", hotelError.message);
            // Rollback : supprimer le owner
            await Utilisateur.findByIdAndDelete(owner._id);
            return errorResponse(res, `Erreur création hôtel: ${hotelError.message}`, 400);
        }

        // ⚡ IMPORTANT : Envoyer email en tâche de fond (SANS AWAIT)
        // Ça évite le timeout si Gmail met trop de temps
        sendEmail({
            to: ownerEmail,
            subject: '🎉 Bienvenue sur HotelBenin - Vos identifiants',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #667eea;">Bienvenue sur HotelBenin !</h2>
                    <p>Bonjour <strong>${ownerPrenom} ${ownerNom}</strong>,</p>
                    <p>Votre hôtel <strong>${nom}</strong> a été créé avec succès.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Email :</strong> ${ownerEmail}</p>
                        <p><strong>Mot de passe :</strong> <code>${tempPassword}</code></p>
                    </div>
                    <p>⚠️ Changez votre mot de passe à la première connexion.</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">Se connecter</a>
                </div>
            `
        }).then(() => {
            console.log("✅ Email envoyé à:", ownerEmail);
        }).catch(emailError => {
            console.error('⚠️ Erreur envoi email (non bloquant):', emailError.message);
        });

        // ✅ RÉPONDRE IMMÉDIATEMENT (sans attendre l'email)
        console.log("✅ === RÉPONSE ENVOYÉE ===");

        // ✅ NOTIFICATION à l'owner (bienvenue)
        // ✅ NOTIFICATION à l'owner (bienvenue)
        try {
            await createNotification({
                utilisateurId: owner._id,
                type: 'nouvel_hotel',
                titre: '🎉 Bienvenue sur HotelBenin !',
                message: `Votre hôtel "${nom}" a été créé. Commencez par ajouter vos chambres.`,
                icone: 'Hotel',
                couleur: 'purple',
                lien: '/owner/hotel/chambres/create'
            });
        } catch (notifErr) {
            console.error('⚠️ Erreur notif (non bloquant):', notifErr.message);
        }
        return successResponse(res, {
            hotel,
            owner: {
                _id: owner._id,
                email: owner.email,
                nom: owner.nom,
                prenom: owner.prenom
            },
            tempPassword
        }, 'Hôtel et propriétaire créés avec succès.', 201);

    } catch (error) {
        console.error("❌❌❌ ERREUR GLOBALE createHotelWithOwner:", error);
        next(error);
    }
};

// ============================================
// LISTES
// ============================================
exports.getAllHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find()
            .populate('proprietaire', 'nom prenom email phone')
            .sort({ createdAt: -1 });
        successResponse(res, { hotels }, 'Hôtels récupérés');
    } catch (error) {
        next(error);
    }
};

exports.getAllOwners = async (req, res, next) => {
    try {
        const owners = await Utilisateur.find({ role: 'owner' }).sort({ createdAt: -1 });
        successResponse(res, { owners }, 'Propriétaires récupérés');
    } catch (error) {
        next(error);
    }
};

exports.getAllClients = async (req, res, next) => {
    try {
        const clients = await Utilisateur.find({ role: 'user' })
            .sort({ createdAt: -1 });
        successResponse(res, { clients }, 'Clients récupérés');
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await Utilisateur.findById(req.params.id);
        if (!user) return errorResponse(res, 'Utilisateur non trouvé', 404);
        successResponse(res, { user }, 'Utilisateur récupéré');
    } catch (error) {
        next(error);
    }
};

exports.getAllReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find()
            .populate('utilisateur', 'nom prenom email')
            .populate({
                path: 'chambre',
                populate: { path: 'hotel', select: 'nom ville' }
            })
            .sort({ createdAt: -1 });
        successResponse(res, { reservations }, 'Réservations récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ACTIONS
// ============================================
exports.verifyHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            { estVerifie: true },
            { new: true }
        );
        if (!hotel) return errorResponse(res, 'Hôtel non trouvé', 404);
        successResponse(res, { hotel }, 'Hôtel vérifié');
    } catch (error) {
        next(error);
    }
};

exports.toggleHotelActive = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return errorResponse(res, 'Hôtel non trouvé', 404);
        hotel.estActif = !hotel.estActif;
        await hotel.save();
        successResponse(res, { hotel }, `Hôtel ${hotel.estActif ? 'activé' : 'désactivé'}`);
    } catch (error) {
        next(error);
    }
};

exports.toggleUserActive = async (req, res, next) => {
    try {
        const user = await Utilisateur.findById(req.params.id);
        if (!user) return errorResponse(res, 'Utilisateur non trouvé', 404);
        user.isActive = !user.isActive;
        await user.save();
        successResponse(res, { user }, `Utilisateur ${user.isActive ? 'activé' : 'bloqué'}`);
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await Utilisateur.findById(req.params.id);
        if (!user) return errorResponse(res, 'Utilisateur non trouvé', 404);
        if (user.role === 'admin') return errorResponse(res, 'Impossible de supprimer un admin', 403);
        await user.deleteOne();
        successResponse(res, {}, 'Utilisateur supprimé');
    } catch (error) {
        next(error);
    }
};

// ============================================
// SUPPRIMER UN HÔTEL (avec cascade)
// ============================================
// ============================================
// SUPPRIMER UN HÔTEL (avec cascade + supprimer owner)
// ============================================
exports.deleteHotel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { raison, supprimerOwner = true } = req.body || {};

        console.log(`🗑️  Suppression hôtel ${id}`);

        const hotel = await Hotel.findById(id).populate('proprietaire');
        if (!hotel) {
            return errorResponse(res, 'Hôtel introuvable', 404);
        }

        const ownerId = hotel.proprietaire?._id;
        const ownerEmail = hotel.proprietaire?.email;
        const ownerNom = hotel.proprietaire ? `${hotel.proprietaire.prenom} ${hotel.proprietaire.nom}` : "";

        // Vérifier si l'owner a d'autres hôtels
        let hasOtherHotels = false;
        if (ownerId) {
            const otherHotels = await Hotel.countDocuments({ 
                proprietaire: ownerId, 
                _id: { $ne: id } 
            });
            hasOtherHotels = otherHotels > 0;
        }

        // Compter les données liées
        const [nbChambres, nbReservations, nbAvis] = await Promise.all([
            Chambre.countDocuments({ hotel: id }),
            Reservation.countDocuments({ hotel: id }),
            require('../model/Avis').countDocuments({ hotel: id })
        ]);

        console.log(`📊 À supprimer : ${nbChambres} chambres, ${nbReservations} réservations, ${nbAvis} avis`);

        // Récupérer les réservations actives pour notifier les clients
        const reservationsActives = await Reservation.find({
            hotel: id,
            statut: { $in: ['en_attente', 'confirmee'] }
        }).populate('utilisateur', 'nom prenom email');

        // Suppression en cascade
        await Chambre.deleteMany({ hotel: id });
        console.log(`✅ ${nbChambres} chambres supprimées`);

        await Reservation.updateMany(
            { hotel: id, statut: { $in: ['en_attente', 'confirmee'] } },
            { statut: 'annulee' }
        );
        console.log(`✅ Réservations actives annulées`);

        await require('../model/Avis').deleteMany({ hotel: id });
        console.log(`✅ ${nbAvis} avis supprimés`);

        await Hotel.findByIdAndDelete(id);
        console.log(`✅ Hôtel ${hotel.nom} supprimé`);

        // ============================================
        // SUPPRIMER LE PROPRIÉTAIRE (si demandé et pas d'autres hôtels)
        // ============================================
        let ownerSupprimeStatus = 'non_supprime';
        
        if (supprimerOwner && ownerId && !hasOtherHotels) {
            // Envoyer email AVANT suppression
            try {
                await sendEmail({
                    to: ownerEmail,
                    subject: '⚠️ Suppression de votre compte HotelBenin',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                                <h1 style="margin: 0;">Compte fermé</h1>
                            </div>
                            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                                <p>Bonjour <strong>${ownerNom}</strong>,</p>
                                <p>Nous vous informons que votre hôtel <strong>"${hotel.nom}"</strong> ainsi que votre compte propriétaire ont été supprimés de la plateforme HotelBenin.</p>
                                
                                ${raison ? `
                                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                    <p style="margin: 0; color: #991b1b;"><strong>Raison :</strong></p>
                                    <p style="margin: 5px 0 0 0; color: #7f1d1d;">${raison}</p>
                                </div>
                                ` : ''}

                                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0; color: #1e40af; font-weight: bold;">📊 Résumé :</p>
                                    <ul style="margin: 10px 0; color: #1e3a8a;">
                                        <li>${nbChambres} chambre(s) supprimée(s)</li>
                                        <li>${nbReservations} réservation(s) traitée(s)</li>
                                        <li>${nbAvis} avis supprimé(s)</li>
                                        <li>Votre compte propriétaire</li>
                                    </ul>
                                </div>

                                <p>Vous pouvez toujours créer un <strong>nouveau compte client</strong> si vous souhaitez utiliser HotelBenin en tant que voyageur.</p>

                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="mailto:contact@hotelbenin.bj" style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                        Contacter le support
                                    </a>
                                </div>

                                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                                <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                    © ${new Date().getFullYear()} HotelBenin
                                </p>
                            </div>
                        </div>
                    `
                }).catch(e => console.error('Erreur email:', e.message));
            } catch (e) {
                console.error('Erreur préparation email:', e.message);
            }

            // Supprimer le compte
            await Utilisateur.findByIdAndDelete(ownerId);
            console.log(`✅ Compte propriétaire ${ownerNom} supprimé`);
            ownerSupprimeStatus = 'supprime';
        } else if (hasOtherHotels) {
            // Le propriétaire a d'autres hôtels, on ne supprime pas mais on notifie
            try {
                await createNotification({
                    utilisateurId: ownerId,
                    type: 'systeme',
                    titre: '⚠️ Votre hôtel a été supprimé',
                    message: `L'administrateur a supprimé "${hotel.nom}". Vos autres hôtels restent actifs.`,
                    icone: 'AlertCircle',
                    couleur: 'red',
                });
            } catch (e) {
                console.error('⚠️ Erreur notif owner:', e.message);
            }
            ownerSupprimeStatus = 'conserve_autres_hotels';
        }

        // Notifier les clients avec réservations actives
        for (const resa of reservationsActives) {
            if (resa.utilisateur) {
                try {
                    await createNotification({
                        utilisateurId: resa.utilisateur._id,
                        type: 'reservation_annulee',
                        titre: '❌ Votre réservation a été annulée',
                        message: `L'hôtel "${hotel.nom}" a été supprimé. Votre réservation a été annulée.`,
                        icone: 'AlertCircle',
                        couleur: 'red',
                        lien: '/client'
                    });
                } catch (e) {
                    console.error('⚠️ Erreur notif client:', e.message);
                }
            }
        }

        successResponse(res, {
            hotelSupprime: hotel.nom,
            ownerSupprime: ownerSupprimeStatus,
            statistiques: {
                chambres: nbChambres,
                reservations: nbReservations,
                avis: nbAvis,
                reservationsActives: reservationsActives.length
            }
        }, 'Hôtel supprimé avec succès', 200);
    } catch (error) {
        console.error('❌ Erreur deleteHotel:', error);
        next(error);
    }
};