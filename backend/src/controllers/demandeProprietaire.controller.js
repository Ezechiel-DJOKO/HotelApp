const DemandeProprietaire = require('../model/DemandeProprietaire');
const Utilisateur = require('../model/User');
const { successResponse, errorResponse } = require('../util/apiResponse');
const { createNotification, notifyAdmins } = require('../util/notificationService');
const sendEmail = require('../util/sendEmail');

// ============================================
// CLIENT : Faire une demande
// ============================================
exports.faireDemande = async (req, res, next) => {
    try {
        const utilisateurId = req.utilisateur._id;

        // Vérifier que c'est bien un client
        if (req.utilisateur.role !== 'user') {
            return errorResponse(res, 'Seuls les clients peuvent faire cette demande', 403);
        }

        // Vérifier qu'il n'y a pas déjà une demande en attente
        const demandeExistante = await DemandeProprietaire.findOne({
            utilisateur: utilisateurId,
            statut: 'en_attente'
        });

        if (demandeExistante) {
            return errorResponse(
                res,
                'Vous avez déjà une demande en attente. Veuillez attendre son traitement.',
                400
            );
        }

        // Extraire les données du body
        const {
            nomHotel,
            typeHotel,
            ville,
            adresse,
            description,
            telephoneHotel,
            emailHotel,
            nombreChambres,
            motivation,
            experience
        } = req.body;

        // Vérifier les documents uploadés
        if (!req.files || !req.files.pieceIdentite) {
            return errorResponse(res, 'La pièce d\'identité est obligatoire', 400);
        }

        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

        // Construire les URLs des documents
        const documents = {
            pieceIdentite: `${baseUrl}/uploads/${req.files.pieceIdentite[0].filename}`,
            rccm: req.files.rccm ? `${baseUrl}/uploads/${req.files.rccm[0].filename}` : undefined,
            autres: []
        };

        // Créer la demande
        const demande = await DemandeProprietaire.create({
            utilisateur: utilisateurId,
            nomHotel,
            typeHotel,
            ville,
            adresse,
            description,
            telephoneHotel,
            emailHotel: emailHotel || undefined,
            nombreChambres: parseInt(nombreChambres) || 0,
            documents,
            motivation,
            experience: experience || ''
        });

        console.log(`✅ Nouvelle demande propriétaire : ${demande._id}`);

        // Notifier tous les admins
        try {
            await notifyAdmins({
                type: 'systeme',
                titre: '🏨 Nouvelle demande de propriétaire',
                message: `${req.utilisateur.prenom} ${req.utilisateur.nom} souhaite devenir propriétaire de "${nomHotel}"`,
                icone: 'UserPlus',
                couleur: 'purple',
                lien: `/admin/demandes-proprietaire/${demande._id}`
            });
        } catch (e) {
            console.error('⚠️ Erreur notif admins:', e.message);
        }

        // Email de confirmation au demandeur
        try {
            await sendEmail({
                to: req.utilisateur.email,
                subject: '✅ Votre demande de propriétaire a été reçue',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0;">🏨 Demande reçue !</h1>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p>Bonjour <strong>${req.utilisateur.prenom}</strong>,</p>
                            <p>Nous avons bien reçu votre demande pour devenir propriétaire de l'hôtel <strong>"${nomHotel}"</strong> sur HotelBenin.</p>
                            
                            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #1e40af;"><strong>📋 Prochaines étapes :</strong></p>
                                <ol style="margin: 10px 0; color: #1e3a8a; padding-left: 20px;">
                                    <li>Notre équipe examine votre demande (24-48h)</li>
                                    <li>Vérification de vos documents</li>
                                    <li>Vous recevez une réponse par email</li>
                                    <li>Si accepté, vous pouvez commencer à gérer votre hôtel</li>
                                </ol>
                            </div>

                            <p><strong>Résumé de votre demande :</strong></p>
                            <ul>
                                <li><strong>Hôtel :</strong> ${nomHotel}</li>
                                <li><strong>Type :</strong> ${typeHotel}</li>
                                <li><strong>Ville :</strong> ${ville}</li>
                            </ul>

                            <p style="color: #6b7280; font-size: 14px;">Vous serez notifié(e) par email et notification dès que votre demande sera traitée.</p>

                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} HotelBenin
                            </p>
                        </div>
                    </div>
                `
            });
        } catch (e) {
            console.error('⚠️ Erreur email:', e.message);
        }

        successResponse(res, { demande }, 'Demande envoyée avec succès', 201);
    } catch (error) {
        console.error('❌ Erreur faireDemande:', error);
        next(error);
    }
};

// ============================================
// CLIENT : Voir mes demandes
// ============================================
exports.getMesDemandes = async (req, res, next) => {
    try {
        const demandes = await DemandeProprietaire.find({
            utilisateur: req.utilisateur._id
        })
            .populate('traitePar', 'nom prenom')
            .sort('-createdAt');

        successResponse(res, { demandes }, 'Mes demandes récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Voir toutes les demandes
// ============================================
exports.getAllDemandes = async (req, res, next) => {
    try {
        const { statut } = req.query;
        const filter = statut ? { statut } : {};

        const demandes = await DemandeProprietaire.find(filter)
            .populate('utilisateur', 'nom prenom email phone avatar createdAt')
            .populate('traitePar', 'nom prenom')
            .sort('-createdAt');

        const stats = {
            total: await DemandeProprietaire.countDocuments(),
            en_attente: await DemandeProprietaire.countDocuments({ statut: 'en_attente' }),
            approuvees: await DemandeProprietaire.countDocuments({ statut: 'approuvee' }),
            refusees: await DemandeProprietaire.countDocuments({ statut: 'refusee' })
        };

        successResponse(res, { demandes, stats }, 'Demandes récupérées');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Voir une demande
// ============================================
exports.getDemande = async (req, res, next) => {
    try {
        const demande = await DemandeProprietaire.findById(req.params.id)
            .populate('utilisateur', 'nom prenom email phone avatar createdAt')
            .populate('traitePar', 'nom prenom');

        if (!demande) {
            return errorResponse(res, 'Demande introuvable', 404);
        }

        successResponse(res, { demande }, 'Demande récupérée');
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN : Approuver une demande
// ============================================
exports.approuverDemande = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notesAdmin } = req.body || {};

        const demande = await DemandeProprietaire.findById(id).populate('utilisateur');
        if (!demande) {
            return errorResponse(res, 'Demande introuvable', 404);
        }

        if (demande.statut !== 'en_attente') {
            return errorResponse(res, 'Cette demande a déjà été traitée', 400);
        }

        // Changer le rôle de l'utilisateur
        const utilisateur = await Utilisateur.findById(demande.utilisateur._id);
        utilisateur.role = 'owner';
        await utilisateur.save();

        // Mettre à jour la demande
        demande.statut = 'approuvee';
        demande.traitePar = req.utilisateur._id;
        demande.dateTraitement = new Date();
        demande.notesAdmin = notesAdmin || '';
        await demande.save();

        console.log(`✅ Demande approuvée : ${demande.utilisateur.email} → owner`);

        // Notifier le client
        try {
            await createNotification({
                utilisateurId: demande.utilisateur._id,
                type: 'systeme',
                titre: '🎉 Félicitations ! Vous êtes propriétaire',
                message: `Votre demande pour "${demande.nomHotel}" a été approuvée ! Vous pouvez maintenant accéder à votre espace propriétaire.`,
                icone: 'CheckCircle',
                couleur: 'green',
                lien: '/owner'
            });
        } catch (e) {
            console.error('⚠️ Erreur notif:', e.message);
        }

        // Email de bienvenue
        try {
            await sendEmail({
                to: demande.utilisateur.email,
                subject: '🎉 Bienvenue en tant que propriétaire sur HotelBenin !',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px;">🎉 Félicitations !</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Vous êtes maintenant propriétaire</p>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p>Bonjour <strong>${demande.utilisateur.prenom}</strong>,</p>
                            <p>Excellente nouvelle ! Votre demande pour devenir propriétaire de <strong>"${demande.nomHotel}"</strong> a été <strong style="color: #10b981;">approuvée</strong> ! 🎊</p>
                            
                            ${notesAdmin ? `
                            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #065f46;"><strong>💬 Message de l'administrateur :</strong></p>
                                <p style="margin: 5px 0 0 0; color: #047857;">${notesAdmin}</p>
                            </div>
                            ` : ''}

                            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #1e40af; font-weight: bold;">📋 Prochaines étapes :</p>
                                <ol style="margin: 10px 0; color: #1e3a8a; padding-left: 20px;">
                                    <li>Connectez-vous à votre nouvel espace propriétaire</li>
                                    <li>L'administrateur créera bientôt votre hôtel</li>
                                    <li>Ajoutez vos chambres et photos</li>
                                    <li>Commencez à recevoir des réservations !</li>
                                </ol>
                            </div>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/owner" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                                    Accéder à mon espace →
                                </a>
                            </div>

                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} HotelBenin. Bienvenue dans la famille !
                            </p>
                        </div>
                    </div>
                `
            });
        } catch (e) {
            console.error('⚠️ Erreur email:', e.message);
        }

        successResponse(res, { demande, utilisateur }, 'Demande approuvée avec succès');
    } catch (error) {
        console.error('❌ Erreur approuverDemande:', error);
        next(error);
    }
};

// ============================================
// ADMIN : Refuser une demande
// ============================================
exports.refuserDemande = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { motifRefus, notesAdmin } = req.body || {};

        if (!motifRefus) {
            return errorResponse(res, 'Le motif du refus est obligatoire', 400);
        }

        const demande = await DemandeProprietaire.findById(id).populate('utilisateur');
        if (!demande) {
            return errorResponse(res, 'Demande introuvable', 404);
        }

        if (demande.statut !== 'en_attente') {
            return errorResponse(res, 'Cette demande a déjà été traitée', 400);
        }

        // Mettre à jour la demande
        demande.statut = 'refusee';
        demande.traitePar = req.utilisateur._id;
        demande.dateTraitement = new Date();
        demande.motifRefus = motifRefus;
        demande.notesAdmin = notesAdmin || '';
        await demande.save();

        console.log(`❌ Demande refusée : ${demande.utilisateur.email}`);

        // Notifier le client
        try {
            await createNotification({
                utilisateurId: demande.utilisateur._id,
                type: 'systeme',
                titre: '❌ Demande refusée',
                message: `Votre demande pour "${demande.nomHotel}" n'a pas été approuvée. Consultez le motif dans vos demandes.`,
                icone: 'XCircle',
                couleur: 'red',
                lien: '/client/mes-demandes'
            });
        } catch (e) {
            console.error('⚠️ Erreur notif:', e.message);
        }

        // Email de refus
        try {
            await sendEmail({
                to: demande.utilisateur.email,
                subject: '❌ Votre demande de propriétaire',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0;">Demande non approuvée</h1>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p>Bonjour <strong>${demande.utilisateur.prenom}</strong>,</p>
                            <p>Nous vous remercions pour votre demande concernant <strong>"${demande.nomHotel}"</strong>. Après examen, nous ne pouvons malheureusement pas y donner suite pour le moment.</p>
                            
                            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                <p style="margin: 0; color: #991b1b;"><strong>Motif du refus :</strong></p>
                                <p style="margin: 5px 0 0 0; color: #7f1d1d;">${motifRefus}</p>
                            </div>

                            <p>Vous pouvez soumettre une nouvelle demande une fois les points ci-dessus corrigés. N'hésitez pas à nous contacter pour plus d'informations.</p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="mailto:contact@hotelbenin.bj" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
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
            });
        } catch (e) {
            console.error('⚠️ Erreur email:', e.message);
        }

        successResponse(res, { demande }, 'Demande refusée');
    } catch (error) {
        console.error('❌ Erreur refuserDemande:', error);
        next(error);
    }
};