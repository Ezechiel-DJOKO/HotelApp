const Opportunite = require('../model/Opportunite');
const Hotel = require('../model/Hotel');
const Utilisateur = require('../model/User');
const { successResponse, errorResponse } = require('../util/apiResponse');
const { createNotification, notifyAdmins } = require('../util/notificationService');
const sendEmail = require('../util/sendEmail');

// ============================================
// CLIENT : Créer une demande
// ============================================
exports.creerOpportunite = async (req, res, next) => {
    try {
        const utilisateurId = req.utilisateur._id;

        if (req.utilisateur.role !== 'user') {
            return errorResponse(res, 'Seuls les clients peuvent faire cette demande', 403);
        }

        const { type } = req.body;

        if (!['proprietaire', 'partenaire', 'construction'].includes(type)) {
            return errorResponse(res, 'Type d\'opportunité invalide', 400);
        }

        // Vérifier pas de demande en attente du même type
        const demandeExistante = await Opportunite.findOne({
            utilisateur: utilisateurId,
            type,
            statut: { $in: ['en_attente', 'en_cours'] }
        });

        if (demandeExistante) {
            return errorResponse(
                res,
                `Vous avez déjà une demande "${type}" en cours. Attendez son traitement.`,
                400
            );
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // Construire les documents
        const documents = {};
        if (req.files) {
            if (req.files.pieceIdentite) {
                documents.pieceIdentite = `${baseUrl}/uploads/${req.files.pieceIdentite[0].filename}`;
            }
            if (req.files.preuveFonds) {
                documents.preuveFonds = `${baseUrl}/uploads/${req.files.preuveFonds[0].filename}`;
            }
            if (req.files.businessPlan) {
                documents.businessPlan = `${baseUrl}/uploads/${req.files.businessPlan[0].filename}`;
            }
            if (req.files.rccm) {
                documents.rccm = `${baseUrl}/uploads/${req.files.rccm[0].filename}`;
            }
            if (req.files.preuveProriete) {
                documents.preuveProriete = `${baseUrl}/uploads/${req.files.preuveProriete[0].filename}`;
            }
        }

        // Créer l'opportunité
        const data = {
            utilisateur: utilisateurId,
            type,
            documents,
            ...req.body
        };

        // Convertir les nombres
        if (data.budgetEstime) data.budgetEstime = parseInt(data.budgetEstime) || 0;
        if (data.montantInvestissement) data.montantInvestissement = parseInt(data.montantInvestissement) || 0;
        if (data.nombreChambresPrevu) data.nombreChambresPrevu = parseInt(data.nombreChambresPrevu) || 0;
        if (data.terrainAcquis) data.terrainAcquis = data.terrainAcquis === 'true' || data.terrainAcquis === true;

        // Parser hotelExterne si c'est une string
        if (typeof data.hotelExterne === 'string') {
            try {
                data.hotelExterne = JSON.parse(data.hotelExterne);
            } catch (e) {
                data.hotelExterne = null;
            }
        }

        const opportunite = await Opportunite.create(data);

        console.log(`✅ Nouvelle opportunité "${type}" créée : ${opportunite._id}`);

        // Notifier les admins
        const typeLabels = {
            proprietaire: '🏨 Devenir Propriétaire',
            partenaire: '🤝 Devenir Partenaire',
            construction: '🏗️ Construire un Hôtel'
        };

        try {
            await notifyAdmins({
                type: 'systeme',
                titre: `${typeLabels[type]} - Nouvelle demande`,
                message: `${req.utilisateur.prenom} ${req.utilisateur.nom} souhaite ${
                    type === 'proprietaire' ? 'devenir propriétaire d\'un hôtel' :
                    type === 'partenaire' ? 'devenir partenaire/sponsor d\'un hôtel' :
                    'construire un nouvel hôtel au Bénin'
                }`,
                icone: 'UserPlus',
                couleur: 'purple',
                lien: `/admin/opportunites/${opportunite._id}`
            });
        } catch (e) {
            console.error('⚠️ Erreur notif:', e.message);
        }

        // Email confirmation
        try {
            await sendEmail({
                to: req.utilisateur.email,
                subject: `✅ Votre demande "${typeLabels[type]}" a été reçue`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0;">${typeLabels[type]}</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Demande reçue !</p>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p>Bonjour <strong>${req.utilisateur.prenom}</strong>,</p>
                            <p>Nous avons bien reçu votre demande. Notre équipe l'examine et vous répondra sous <strong>48 heures</strong>.</p>
                            <p style="color: #6b7280; font-size: 14px;">Un conseiller vous contactera pour discuter de votre projet en détail.</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} HotelBenin</p>
                        </div>
                    </div>
                `
            });
        } catch (e) {
            console.error('⚠️ Erreur email:', e.message);
        }

        successResponse(res, { opportunite }, 'Demande envoyée avec succès', 201);
    } catch (error) {
        console.error('❌ Erreur creerOpportunite:', error);
        next(error);
    }
};

// ============================================
// CLIENT : Mes opportunités
// ============================================
exports.getMesOpportunites = async (req, res, next) => {
    try {
        const opportunites = await Opportunite.find({
            utilisateur: req.utilisateur._id
        })
            .populate('hotelCible', 'nom ville etoiles images slug')
            .populate('traitePar', 'nom prenom')
            .sort('-createdAt');

        successResponse(res, { opportunites }, 'Mes opportunités récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Toutes les opportunités
// ============================================
exports.getAllOpportunites = async (req, res, next) => {
    try {
        const { type, statut } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (statut) filter.statut = statut;

        const opportunites = await Opportunite.find(filter)
            .populate('utilisateur', 'nom prenom email phone avatar createdAt')
            .populate('hotelCible', 'nom ville etoiles images slug proprietaire')
            .populate('traitePar', 'nom prenom')
            .sort('-createdAt');

        const stats = {
            total: await Opportunite.countDocuments(),
            en_attente: await Opportunite.countDocuments({ statut: 'en_attente' }),
            en_cours: await Opportunite.countDocuments({ statut: 'en_cours' }),
            approuvees: await Opportunite.countDocuments({ statut: 'approuvee' }),
            refusees: await Opportunite.countDocuments({ statut: 'refusee' }),
            parType: {
                proprietaire: await Opportunite.countDocuments({ type: 'proprietaire' }),
                partenaire: await Opportunite.countDocuments({ type: 'partenaire' }),
                construction: await Opportunite.countDocuments({ type: 'construction' })
            }
        };

        successResponse(res, { opportunites, stats }, 'Opportunités récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Détail d'une opportunité
// ============================================
exports.getOpportunite = async (req, res, next) => {
    try {
        const opportunite = await Opportunite.findById(req.params.id)
            .populate('utilisateur', 'nom prenom email phone avatar createdAt')
            .populate('hotelCible', 'nom ville etoiles adresse images slug proprietaire telephone email')
            .populate('traitePar', 'nom prenom');

        if (!opportunite) {
            return errorResponse(res, 'Opportunité introuvable', 404);
        }

        successResponse(res, { opportunite }, 'Opportunité récupérée');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Changer le statut
// ============================================
exports.updateStatut = async (req, res, next) => {
    try {
        const { statut, notesAdmin, motifRefus } = req.body;

        const opportunite = await Opportunite.findById(req.params.id)
            .populate('utilisateur');

        if (!opportunite) {
            return errorResponse(res, 'Opportunité introuvable', 404);
        }

        if (statut === 'refusee' && !motifRefus) {
            return errorResponse(res, 'Le motif du refus est obligatoire', 400);
        }

        opportunite.statut = statut;
        opportunite.traitePar = req.utilisateur._id;
        opportunite.dateTraitement = new Date();
        if (notesAdmin) opportunite.notesAdmin = notesAdmin;
        if (motifRefus) opportunite.motifRefus = motifRefus;

        await opportunite.save();

        // Si approuvée et type proprietaire → upgrade le user
        if (statut === 'approuvee' && opportunite.type === 'proprietaire') {
            const user = await Utilisateur.findById(opportunite.utilisateur._id);
            if (user && user.role === 'user') {
                user.role = 'owner';
                await user.save();
                console.log(`✅ ${user.email} → owner`);
            }
        }

        // Notifier le demandeur
        const statusMessages = {
            en_cours: { titre: '🔄 Demande en cours d\'examen', couleur: 'blue' },
            approuvee: { titre: '🎉 Demande approuvée !', couleur: 'green' },
            refusee: { titre: '❌ Demande refusée', couleur: 'red' },
            terminee: { titre: '✅ Projet terminé', couleur: 'green' }
        };

        const msgConfig = statusMessages[statut];
        if (msgConfig) {
            try {
                await createNotification({
                    utilisateurId: opportunite.utilisateur._id,
                    type: 'systeme',
                    titre: msgConfig.titre,
                    message: motifRefus || notesAdmin || 'Consultez votre espace pour plus de détails.',
                    icone: statut === 'approuvee' ? 'CheckCircle' : statut === 'refusee' ? 'XCircle' : 'Clock',
                    couleur: msgConfig.couleur,
                    lien: '/client/mes-opportunites'
                });
            } catch (e) {
                console.error('⚠️ Erreur notif:', e.message);
            }
        }

        successResponse(res, { opportunite }, 'Statut mis à jour');
    } catch (error) {
        console.error('❌ Erreur updateStatut:', error);
        next(error);
    }
};