const path = require('path');
const fs = require('fs');
const Transaction = require('../model/Transaction');
const Reservation = require('../model/Reservations');
const Hotel = require('../model/Hotel');
const Chambre = require('../model/Chambre');
const Utilisateur = require('../model/User');
const { successResponse, errorResponse } = require('../util/apiResponse');
const {
    calculerCommission,
    genererNumeroTransaction,
    genererNumeroReçu
} = require('../util/commissionCalculator');
const { simulerPaiement } = require('../util/paymentSimulator');
const { genererRecuPDF } = require('../util/pdfGenerator');
const { createNotification } = require('../util/notificationService');
const sendEmail = require('../util/sendEmail');

// ============================================
// INITIER UN PAIEMENT
// Étape 1 : le client clique "Payer"
// ============================================
exports.initierPaiement = async (req, res, next) => {
    try {
        const { reservationId } = req.body;
        const utilisateurId = req.utilisateur._id;

        console.log(`💳 Initiation paiement - Reservation: ${reservationId}`);

        // Récupérer la réservation
        const reservation = await Reservation.findById(reservationId)
            .populate('chambre')
            .populate('hotel');

        if (!reservation) {
            return errorResponse(res, 'Réservation introuvable', 404);
        }

        // Vérifier que c'est bien le propriétaire
        if (reservation.utilisateur.toString() !== utilisateurId.toString()) {
            return errorResponse(res, 'Non autorisé', 403);
        }

        // Vérifier qu'il n'y a pas déjà un paiement réussi
        const paiementExistant = await Transaction.findOne({
            reservation: reservationId,
            statut: 'reussi'
        });

        if (paiementExistant) {
            return errorResponse(res, 'Cette réservation est déjà payée', 400);
        }

        // Calculer la commission
        const hotel = reservation.hotel;
        const commission = calculerCommission(reservation.prixTotal, hotel.etoiles);

        return successResponse(res, {
            reservationId: reservation._id,
            montantTotal: reservation.prixTotal,
            devise: 'XOF',
            hotel: {
                nom: hotel.nom,
                etoiles: hotel.etoiles
            },
            chambre: {
                nom: reservation.chambre.nom
            },
            dates: {
                arrivee: reservation.dateArrivee,
                depart: reservation.dateDepart
            },
            paymentMode: process.env.PAYMENT_MODE || 'demo',
            methodesDisponibles: [
                { id: 'mtn_momo', nom: 'MTN Mobile Money', icon: '📱', couleur: 'yellow' },
                { id: 'moov_money', nom: 'Moov Money', icon: '📱', couleur: 'blue' },
                { id: 'orange_money', nom: 'Orange Money', icon: '📱', couleur: 'orange' },
                { id: 'wave', nom: 'Wave', icon: '💙', couleur: 'blue' },
                { id: 'carte_visa', nom: 'Carte Visa', icon: '💳', couleur: 'blue' },
                { id: 'carte_mastercard', nom: 'Carte Mastercard', icon: '💳', couleur: 'red' }
            ]
        }, 'Paiement initialisé');
    } catch (error) {
        console.error('❌ Erreur initierPaiement:', error);
        next(error);
    }
};

// ============================================
// CONFIRMER LE PAIEMENT
// Étape 2 : le client valide dans le modal
// ============================================
exports.confirmerPaiement = async (req, res, next) => {
    try {
        const { reservationId, methode, telephone } = req.body;
        const utilisateurId = req.utilisateur._id;

        console.log(`💳 Confirmation paiement - Reservation: ${reservationId}, Méthode: ${methode}`);

        // Vérifications
        const reservation = await Reservation.findById(reservationId)
            .populate('chambre')
            .populate('hotel')
            .populate('utilisateur');

        if (!reservation) {
            return errorResponse(res, 'Réservation introuvable', 404);
        }

        if (reservation.utilisateur._id.toString() !== utilisateurId.toString()) {
            return errorResponse(res, 'Non autorisé', 403);
        }

        // Vérifier pas de doublon
        const paiementExistant = await Transaction.findOne({
            reservation: reservationId,
            statut: 'reussi'
        });

        if (paiementExistant) {
            return errorResponse(res, 'Cette réservation est déjà payée', 400);
        }

        // Vérifier la méthode
        const methodesValides = ['mtn_momo', 'moov_money', 'orange_money', 'wave', 'carte_visa', 'carte_mastercard'];
        if (!methodesValides.includes(methode)) {
            return errorResponse(res, 'Méthode de paiement invalide', 400);
        }

        // Vérifier téléphone pour MoMo
        const requiresTelephone = ['mtn_momo', 'moov_money', 'orange_money', 'wave'];
        if (requiresTelephone.includes(methode) && !telephone) {
            return errorResponse(res, 'Numéro de téléphone requis pour ce mode de paiement', 400);
        }

        const hotel = reservation.hotel;
        const chambre = reservation.chambre;
        const utilisateur = reservation.utilisateur;

        // Calculer la commission
        const commission = calculerCommission(reservation.prixTotal, hotel.etoiles);

        // ============================================
        // TRAITEMENT DU PAIEMENT (MODE DÉMO)
        // ============================================
        const paymentMode = process.env.PAYMENT_MODE || 'demo';
        let resultatPaiement;

        if (paymentMode === 'demo') {
            console.log('🎭 Mode DÉMO - Simulation du paiement');
            resultatPaiement = await simulerPaiement({
                montant: reservation.prixTotal,
                methode,
                telephone
            });
        } else {
            // TODO : Intégration CinetPay réelle (plus tard)
            return errorResponse(res, 'Mode de paiement non implémenté', 501);
        }

        // Si paiement échoué
        if (!resultatPaiement.success) {
            // Créer une transaction échouée pour l'historique
            await Transaction.create({
                reservation: reservation._id,
                utilisateur: utilisateurId,
                hotel: hotel._id,
                numeroTransaction: genererNumeroTransaction(),
                montantTotal: reservation.prixTotal,
                tauxCommission: commission.tauxCommission,
                montantCommission: commission.montantCommission,
                montantHotel: commission.montantHotel,
                methode,
                telephonePayeur: telephone,
                statut: 'echoue',
                erreur: resultatPaiement.error,
                referenceExterne: resultatPaiement.reference
            });

            return errorResponse(res, resultatPaiement.error || 'Paiement échoué', 400);
        }

        // ============================================
        // PAIEMENT RÉUSSI
        // ============================================
        const numeroTransaction = genererNumeroTransaction();
        const numeroReçu = genererNumeroReçu();

        console.log(`✅ Paiement réussi - ${numeroTransaction}`);

        // Créer la transaction
        const transaction = await Transaction.create({
            reservation: reservation._id,
            utilisateur: utilisateurId,
            hotel: hotel._id,
            numeroTransaction,
            montantTotal: reservation.prixTotal,
            tauxCommission: commission.tauxCommission,
            montantCommission: commission.montantCommission,
            montantHotel: commission.montantHotel,
            methode,
            telephonePayeur: telephone,
            statut: 'reussi',
            referenceExterne: resultatPaiement.reference,
            donneesExternes: resultatPaiement.transactionData,
            numeroReçu,
            datePaiement: new Date()
        });

        // Passer la réservation en "payée" (pas encore confirmée par l'owner)
        reservation.statut = 'payee';
        await reservation.save();

        // ============================================
        // GÉNÉRER LE REÇU PDF
        // ============================================
        console.log('📄 Génération du reçu PDF...');
        let receiptInfo = null;
        try {
            receiptInfo = await genererRecuPDF(
                transaction,
                reservation,
                hotel,
                chambre,
                utilisateur
            );

            // Sauvegarder le chemin du reçu
            transaction.receiptPdfPath = receiptInfo.fileName;
            transaction.qrCodeData = receiptInfo.qrCodeData;
            await transaction.save();

            console.log('✅ Reçu PDF créé');
        } catch (pdfError) {
            console.error('⚠️ Erreur PDF (non bloquant):', pdfError.message);
        }

        // ============================================
        // ENVOYER L'EMAIL AU CLIENT
        // ============================================
        try {
            const nuits = Math.ceil(
                (new Date(reservation.dateDepart).getTime() -
                    new Date(reservation.dateArrivee).getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            const emailOptions = {
                to: utilisateur.email,
                subject: `✅ Paiement confirmé - Réservation ${numeroReçu}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #1e40af 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">✅ Paiement confirmé !</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre séjour est réservé</p>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
                            <p style="font-size: 16px;">Bonjour <strong>${utilisateur.prenom}</strong>,</p>
                            <p>Nous avons bien reçu votre paiement pour votre réservation à <strong>${hotel.nom}</strong>.</p>
                            
                            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                                <h3 style="margin: 0 0 15px 0; color: #1e40af;">📋 Détails de la réservation</h3>
                                <table style="width: 100%; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Numéro de reçu :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${numeroReçu}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Hôtel :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${hotel.nom}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Chambre :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${chambre.nom}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Arrivée :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${new Date(reservation.dateArrivee).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Départ :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${new Date(reservation.dateDepart).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px 0; color: #64748b;">Durée :</td>
                                        <td style="padding: 5px 0; font-weight: bold; text-align: right;">${nuits} nuit${nuits > 1 ? 's' : ''}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <p style="margin: 0; color: #166534; font-size: 14px;">MONTANT TOTAL PAYÉ</p>
                                <p style="margin: 5px 0; color: #166534; font-size: 32px; font-weight: bold;">
                                    ${reservation.prixTotal.toLocaleString('fr-FR')} XOF
                                </p>
                            </div>
                            
                            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>📄 IMPORTANT :</strong> Votre reçu PDF est en pièce jointe. 
                                    Présentez-le à l'hôtel lors de votre arrivée (impression ou version mobile).
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/reservations/${reservation._id}" 
                                   style="display: inline-block; background: #1e40af; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                                    Voir ma réservation
                                </a>
                            </div>
                            
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                            <p style="color: #6b7280; font-size: 12px; text-align: center;">
                                Bon séjour au Bénin ! 🇧🇯<br>
                                © ${new Date().getFullYear()} HotelBenin. Tous droits réservés.
                            </p>
                        </div>
                    </div>
                `
            };

            // Ajouter le PDF en pièce jointe
            if (receiptInfo) {
                const receiptPath = path.join(__dirname, '../../receipts', receiptInfo.fileName);
                if (fs.existsSync(receiptPath)) {
                    emailOptions.attachments = [
                        {
                            filename: `Recu-HotelBenin-${numeroReçu}.pdf`,
                            path: receiptPath,
                            contentType: 'application/pdf'
                        }
                    ];
                }
            }

            await sendEmail(emailOptions);
            console.log('✅ Email envoyé au client');
        } catch (emailError) {
            console.error('⚠️ Erreur email (non bloquant):', emailError.message);
        }

        // ============================================
        // NOTIFICATIONS
        // ============================================
        try {
            // Notif au client
            await createNotification({
                utilisateurId,
                type: 'paiement_recu',
                titre: '✅ Paiement reçu !',
                message: `Votre paiement pour "${hotel.nom}" a été reçu. L'hôtelier va confirmer votre réservation sous peu.`,
                icone: 'CheckCircle',
                couleur: 'green',
                lien: `/client/reservations/${reservation._id}`
            });

            // Notif à l'owner
            await createNotification({
                utilisateurId: hotel.proprietaire,
                type: 'nouvelle_reservation',
                titre: '💰 Nouvelle réservation payée !',
                message: `${utilisateur.prenom} ${utilisateur.nom} a payé ${reservation.prixTotal.toLocaleString('fr-FR')} XOF pour "${chambre.nom}". Confirmez la réservation dans votre espace.`,
                icone: 'CreditCard',
                couleur: 'green',
                lien: `/owner/reservations/${reservation._id}`
            });
        } catch (notifErr) {
            console.error('⚠️ Erreur notif (non bloquant):', notifErr.message);
        }

        successResponse(res, {
            transaction: {
                numeroTransaction: transaction.numeroTransaction,
                numeroReçu: transaction.numeroReçu,
                montantTotal: transaction.montantTotal,
                methode: transaction.methode,
                statut: transaction.statut,
                receiptUrl: `/api/payments/receipt/${transaction._id}`
            },
            reservation: {
                _id: reservation._id,
                statut: reservation.statut
            }
        }, 'Paiement confirmé avec succès', 200);
    } catch (error) {
        console.error('❌ Erreur confirmerPaiement:', error);
        next(error);
    }
};

// ============================================
// TÉLÉCHARGER LE REÇU PDF
// ============================================
exports.telechargerRecu = async (req, res, next) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return errorResponse(res, 'Transaction introuvable', 404);
        }

        // Vérifier accès
        if (
            transaction.utilisateur.toString() !== req.utilisateur._id.toString() &&
            req.utilisateur.role !== 'admin'
        ) {
            return errorResponse(res, 'Non autorisé', 403);
        }

        if (!transaction.receiptPdfPath) {
            return errorResponse(res, 'Reçu non disponible', 404);
        }

        const filePath = path.join(__dirname, '../../receipts', transaction.receiptPdfPath);

        if (!fs.existsSync(filePath)) {
            return errorResponse(res, 'Fichier reçu introuvable', 404);
        }

        res.download(filePath, `Recu-HotelBenin-${transaction.numeroReçu}.pdf`);
    } catch (error) {
        console.error('❌ Erreur telechargerRecu:', error);
        next(error);
    }
};

// ============================================
// MES PAIEMENTS (client)
// ============================================
exports.getMesPaiements = async (req, res, next) => {
    try {
        const transactions = await Transaction.find({
            utilisateur: req.utilisateur._id
        })
            .populate({
                path: 'reservation',
                populate: {
                    path: 'chambre',
                    select: 'nom type'
                }
            })
            .populate('hotel', 'nom ville images slug')
            .sort('-createdAt');

        successResponse(res, { transactions }, 'Mes paiements récupérés');
    } catch (error) {
        next(error);
    }
};

// ============================================
// REVENUS OWNER
// ============================================
exports.getMesRevenus = async (req, res, next) => {
    try {
        // Récupérer les hôtels du owner
        const hotels = await Hotel.find({ proprietaire: req.utilisateur._id }).select('_id');
        const hotelIds = hotels.map(h => h._id);

        // Toutes les transactions réussies
        const transactions = await Transaction.find({
            hotel: { $in: hotelIds },
            statut: 'reussi'
        })
            .populate({
                path: 'reservation',
                populate: { path: 'chambre', select: 'nom' }
            })
            .populate('utilisateur', 'nom prenom email')
            .populate('hotel', 'nom')
            .sort('-createdAt');

        // Calculs
        const stats = {
            totalTransactions: transactions.length,
            revenuBrut: transactions.reduce((sum, t) => sum + t.montantTotal, 0),
            totalCommission: transactions.reduce((sum, t) => sum + t.montantCommission, 0),
            revenuNet: transactions.reduce((sum, t) => sum + t.montantHotel, 0),
            deja_verse: transactions.filter(t => t.reverse).reduce((sum, t) => sum + t.montantHotel, 0),
            a_recevoir: transactions.filter(t => !t.reverse).reduce((sum, t) => sum + t.montantHotel, 0),
            en_attente: transactions.filter(t => !t.reverse).length,
            deja_paye: transactions.filter(t => t.reverse).length
        };

        successResponse(res, {
            transactions,
            stats
        }, 'Revenus récupérés');
    } catch (error) {
        console.error('❌ Erreur getMesRevenus:', error);
        next(error);
    }
};

// ============================================
// ADMIN : TOUTES LES TRANSACTIONS
// ============================================
exports.getAllTransactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find()
            .populate({
                path: 'reservation',
                populate: { path: 'chambre', select: 'nom' }
            })
            .populate('utilisateur', 'nom prenom email')
            .populate('hotel', 'nom ville')
            .sort('-createdAt');

        const stats = {
            totalTransactions: transactions.length,
            revenuTotal: transactions
                .filter(t => t.statut === 'reussi')
                .reduce((sum, t) => sum + t.montantTotal, 0),
            commissionsTotales: transactions
                .filter(t => t.statut === 'reussi')
                .reduce((sum, t) => sum + t.montantCommission, 0),
            aReverser: transactions
                .filter(t => t.statut === 'reussi' && !t.reverse)
                .reduce((sum, t) => sum + t.montantHotel, 0),
            transactionsReussies: transactions.filter(t => t.statut === 'reussi').length,
            transactionsEchouees: transactions.filter(t => t.statut === 'echoue').length
        };

        successResponse(res, { transactions, stats }, 'Toutes les transactions');
    } catch (error) {
        next(error);
    }
};