const path = require('path');
const fs = require('fs');
const Reversement = require('../model/Reversement');
const Transaction = require('../model/Transaction');
const Hotel = require('../model/Hotel');
const Utilisateur = require('../model/User');
const { successResponse, errorResponse } = require('../util/apiResponse');
const { createNotification } = require('../util/notificationService');
const sendEmail = require('../util/sendEmail');
const { genererRelevePDF } = require('../util/relevePdfGenerator');

// Générer numéro de reversement
const genererNumeroReversement = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(10000 + Math.random() * 90000);
    return `REV-${yyyy}${mm}${dd}-${random}`;
};

// ============================================
// LISTE DES HÔTELS AVEC MONTANTS À VERSER
// ============================================
exports.getHotelsAVerser = async (req, res, next) => {
    try {
        // Récupérer toutes les transactions réussies non versées
        const transactions = await Transaction.find({
            statut: 'reussi',
            reverse: false
        }).populate('hotel', 'nom ville etoiles proprietaire');

        // Regrouper par hôtel
        const parHotel = {};
        transactions.forEach(t => {
            if (!t.hotel) return;
            const hotelId = t.hotel._id.toString();
            if (!parHotel[hotelId]) {
                parHotel[hotelId] = {
                    hotel: {
                        _id: t.hotel._id,
                        nom: t.hotel.nom,
                        ville: t.hotel.ville,
                        etoiles: t.hotel.etoiles,
                        proprietaire: t.hotel.proprietaire
                    },
                    transactions: [],
                    montantTotal: 0,
                    nombreTransactions: 0
                };
            }
            parHotel[hotelId].transactions.push(t);
            parHotel[hotelId].montantTotal += t.montantHotel;
            parHotel[hotelId].nombreTransactions += 1;
        });

        // Enrichir avec les infos owner
        const resultat = await Promise.all(
            Object.values(parHotel).map(async (item) => {
                const owner = await Utilisateur.findById(item.hotel.proprietaire)
                    .select('nom prenom email phone');
                return {
                    ...item,
                    owner
                };
            })
        );

        // Trier par montant décroissant
        resultat.sort((a, b) => b.montantTotal - a.montantTotal);

        successResponse(res, {
            hotels: resultat,
            totalGeneral: resultat.reduce((sum, h) => sum + h.montantTotal, 0),
            nombreHotels: resultat.length
        }, 'Hôtels à verser récupérés');
    } catch (error) {
        console.error('❌ Erreur getHotelsAVerser:', error);
        next(error);
    }
};

// ============================================
// EFFECTUER UN REVERSEMENT
// ============================================
exports.effectuerReversement = async (req, res, next) => {
    try {
        const { hotelId, methode, referenceExterne, destinataire, notes } = req.body;

        console.log(`💰 Effectuer reversement pour hôtel ${hotelId}`);

        if (!hotelId || !methode || !referenceExterne) {
            return errorResponse(res, 'Champs obligatoires manquants', 400);
        }

        // Récupérer l'hôtel
        const hotel = await Hotel.findById(hotelId).populate('proprietaire');
        if (!hotel) {
            return errorResponse(res, 'Hôtel introuvable', 404);
        }

        // Récupérer les transactions non versées
        const transactions = await Transaction.find({
            hotel: hotelId,
            statut: 'reussi',
            reverse: false
        });

        if (transactions.length === 0) {
            return errorResponse(res, 'Aucune transaction à verser', 400);
        }

        const montantTotal = transactions.reduce((sum, t) => sum + t.montantHotel, 0);
        const numeroReversement = genererNumeroReversement();

        // Créer le reversement
        const reversement = await Reversement.create({
            hotel: hotel._id,
            proprietaire: hotel.proprietaire._id,
            admin: req.utilisateur._id,
            numeroReversement,
            transactions: transactions.map(t => t._id),
            montantTotal,
            nombreTransactions: transactions.length,
            methode,
            destinataire: destinataire || {},
            referenceExterne,
            notes,
            statut: 'effectue',
            dateReversement: new Date()
        });

        // Marquer toutes les transactions comme versées
        await Transaction.updateMany(
            { _id: { $in: transactions.map(t => t._id) } },
            {
                $set: {
                    reverse: true,
                    dateReversement: new Date(),
                    reversementRef: reversement._id
                }
            }
        );

        console.log(`✅ Reversement créé : ${numeroReversement}`);

        // Générer PDF du relevé
        try {
            const populated = await Reversement.findById(reversement._id)
                .populate('hotel')
                .populate('proprietaire')
                .populate('admin')
                .populate({
                    path: 'transactions',
                    populate: [
                        { path: 'utilisateur', select: 'nom prenom' },
                        { path: 'reservation', populate: { path: 'chambre', select: 'nom' } }
                    ]
                });

            const releveInfo = await genererRelevePDF(populated);
            reversement.relevePdfPath = releveInfo.fileName;
            await reversement.save();

            console.log(`✅ Relevé PDF généré : ${releveInfo.fileName}`);
        } catch (pdfErr) {
            console.error('⚠️ Erreur PDF (non bloquant):', pdfErr.message);
        }

        // Notifier l'owner
        try {
            await createNotification({
                utilisateurId: hotel.proprietaire._id,
                type: 'paiement_recu',
                titre: '💰 Reversement reçu !',
                message: `Vous avez reçu ${montantTotal.toLocaleString('fr-FR')} XOF via ${methode.replace('_', ' ')}. Réf : ${referenceExterne}`,
                icone: 'DollarSign',
                couleur: 'green',
                lien: '/owner/revenus'
            });
        } catch (e) {
            console.error('⚠️ Erreur notif:', e.message);
        }

        // Envoyer email à l'owner
        try {
            const emailOptions = {
                to: hotel.proprietaire.email,
                subject: `💰 Reversement effectué - ${numeroReversement}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">💰 Reversement effectué !</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre argent est en route</p>
                        </div>
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p>Bonjour <strong>${hotel.proprietaire.prenom}</strong>,</p>
                            <p>Un reversement de <strong>${montantTotal.toLocaleString('fr-FR')} XOF</strong> a été effectué pour votre hôtel <strong>${hotel.nom}</strong>.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #059669;">📋 Détails du reversement</h3>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">N° Reversement :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${numeroReversement}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Nombre de transactions :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${transactions.length}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Méthode :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${methode.replace('_', ' ').toUpperCase()}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Référence :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${referenceExterne}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Date :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${new Date().toLocaleDateString('fr-FR')}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <p style="margin: 0; color: #166534; font-size: 14px;">MONTANT VERSÉ</p>
                                <p style="margin: 5px 0; color: #166534; font-size: 32px; font-weight: bold;">
                                    ${montantTotal.toLocaleString('fr-FR')} XOF
                                </p>
                            </div>
                            
                            <p style="color: #64748b; font-size: 14px;">
                                Le relevé détaillé est en pièce jointe.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/owner/revenus" 
                                   style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                    Voir mes revenus
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                © ${new Date().getFullYear()} HotelBenin. Merci de votre confiance !
                            </p>
                        </div>
                    </div>
                `
            };

            if (reversement.relevePdfPath) {
                const releverPath = path.join(__dirname, '../../releves', reversement.relevePdfPath);
                if (fs.existsSync(releverPath)) {
                    emailOptions.attachments = [{
                        filename: `Releve-${numeroReversement}.pdf`,
                        path: releverPath
                    }];
                }
            }

            await sendEmail(emailOptions);
            console.log('✅ Email envoyé à l\'owner');
        } catch (emailErr) {
            console.error('⚠️ Erreur email:', emailErr.message);
        }

        successResponse(res, {
            reversement,
            transactionsMarquees: transactions.length
        }, 'Reversement effectué avec succès', 201);
    } catch (error) {
        console.error('❌ Erreur effectuerReversement:', error);
        next(error);
    }
};

// ============================================
// HISTORIQUE DES REVERSEMENTS (ADMIN)
// ============================================
exports.getAllReversements = async (req, res, next) => {
    try {
        const reversements = await Reversement.find()
            .populate('hotel', 'nom ville')
            .populate('proprietaire', 'nom prenom email')
            .populate('admin', 'nom prenom')
            .sort('-createdAt');

        const stats = {
            totalReversements: reversements.length,
            montantTotalVerse: reversements
                .filter(r => r.statut === 'effectue')
                .reduce((sum, r) => sum + r.montantTotal, 0)
        };

        successResponse(res, { reversements, stats }, 'Reversements récupérés');
    } catch (error) {
        next(error);
    }
};

// ============================================
// MES REVERSEMENTS (OWNER)
// ============================================
exports.getMesReversements = async (req, res, next) => {
    try {
        const reversements = await Reversement.find({
            proprietaire: req.utilisateur._id
        })
            .populate('hotel', 'nom ville')
            .populate('admin', 'nom prenom')
            .sort('-createdAt');

        successResponse(res, { reversements }, 'Mes reversements');
    } catch (error) {
        next(error);
    }
};

// ============================================
// TÉLÉCHARGER LE RELEVÉ PDF
// ============================================
exports.telechargerReleve = async (req, res, next) => {
    try {
        const reversement = await Reversement.findById(req.params.id);
        if (!reversement) {
            return errorResponse(res, 'Reversement introuvable', 404);
        }

        // Vérifier accès (admin ou owner concerné)
        if (
            req.utilisateur.role !== 'admin' &&
            reversement.proprietaire.toString() !== req.utilisateur._id.toString()
        ) {
            return errorResponse(res, 'Non autorisé', 403);
        }

        if (!reversement.relevePdfPath) {
            return errorResponse(res, 'Relevé non disponible', 404);
        }

        const filePath = path.join(__dirname, '../../releves', reversement.relevePdfPath);
        if (!fs.existsSync(filePath)) {
            return errorResponse(res, 'Fichier introuvable', 404);
        }

        res.download(filePath, `Releve-${reversement.numeroReversement}.pdf`);
    } catch (error) {
        next(error);
    }
};