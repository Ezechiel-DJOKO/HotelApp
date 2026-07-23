const jwt = require('jsonwebtoken');
const Utilisateur = require('../model/User');
const sendEmail = require('../util/sendEmail');
const { successResponse, errorResponse } = require('../util/apiResponse');
const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

exports.inscription = async (req,res,next) => {
    try {
        const  {email,password,password_confirm,nom,prenom,phone} = req.body;
        if (password != password_confirm){
            return errorResponse(res,"Le mot de passe est différent de celui confirmé.",400);
        }

        // Vérification de l'existence de l'email
        const existingEmail = await Utilisateur.findOne({email});
        if (existingEmail) {
            return errorResponse(res,"Cet email est déjà utilisé pour un compte.",400);
        }

        // Création de l'utilisateur
        const utilisateur = await Utilisateur.create({
            email,
            password,
            nom,
            prenom,
            phone: phone || ""
        });

        // Génération de l'otp
        const otp = utilisateur.generateOTP();
        await utilisateur.save({validateBeforeSave: false});

        // Envoie de l'email avec OTP
        try{
            await sendEmail({
                to: utilisateur.email,
                subject: 'Votre code de vérification',
                text: `Bonjour ${utilisateur.prenom},\n\nVotre code de vérification est : ${otp}\n\nCe code est valable pendant 10 minutes.\n\nCordialement,\nL'équipe Mobile API`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #667eea;">Vérification de votre compte</h2>
                    <p>Bonjour <strong>${utilisateur.prenom}</strong>,</p>
                    <p>Votre code de vérification est :</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
                    <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #6b7280; font-size: 12px;">© 2024 Mobile API. Tous droits réservés.</p>
                      </div>`
            });
            successResponse(res,{
                utilisateurID: utilisateur._id,
                email: utilisateur.email,
                otpCode: process.env.NODE_ENV === 'development' ? otp : undefined
            },'Inscription réussie. Vérifier votre email pour le code OTP.', 201);
        } catch (emailError) {
            console.error('Erreur détaillée lors de l\'envoi email:', emailError);
            await Utilisateur.findByIdAndDelete(utilisateur._id);
            if (process.env.NODE_ENV === 'development') {
                return errorResponse(res, `Erreur email: ${emailError.message}`, 500);
            }
            return errorResponse(res, "Erreur lors de l'envoi de l'email. Veuillez réessayer.", 500);
        }
    }catch (error){
        next(error);
    }
};

exports.verificationOTP = async (req,res,next) => {
    try{
        const {email,otpCode} = req.body;
        const utilisateur = await Utilisateur.findOne({email});
        if (!utilisateur){
            return errorResponse(res,"Utilisateur non trouvé",404);
        }

        if (utilisateur.verifyOTP(otpCode)){
            await utilisateur.save({validateBeforeSave: false});
            const token = generateToken(utilisateur._id);
            successResponse(res,{
                utilisateur: {
                    id: utilisateur._id,
                    email: utilisateur.email,
                    nom: utilisateur.nom,
                    prenom: utilisateur.prenom,
                    phone: utilisateur.phone,
                    avatar: utilisateur.avatar,
                    isVerified: utilisateur.isVerified,
                    nomComplet: utilisateur.nomComplet,
                },
                token
            },"Compte vérifié avec succès");
        }else {
            errorResponse(res,"Code OTP invalide ou expiré.",400);
        }
    }catch (error){
        next(error);
    }
};

exports.renvoieOTP = async (req,res,next) => {
    try{
        const {email} = req.body;
        const utilisateur = await Utilisateur.findOne({email});
        if(!utilisateur){
            return errorResponse(res, "Utilisateur non trouvé",404);
        }

        if (utilisateur.isVerified){
            return errorResponse(res, "Ce compte est déjà vérifié.",400);
        }

        // Générer un nouveau OTP
        const otp = utilisateur.generateOTP();
        await utilisateur.save({validateBeforeSave: false});

        // Renvoyer l'email
        await sendEmail({
            to: utilisateur.email,
            subject: 'Nouveau code de vérification',
            text:`Bonjour ${utilisateur.prenom},\n\n Votre nouveau code est : ${otp}\n\nCe code est valable pendant 10 minutes.\n\nCordialement,\nL'équipe Mobile API`,
            html: `

            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Vérification de votre compte</h2>
            <p>Bonjour <strong>${utilisateur.prenom}</strong>,</p>
            <p>Votre nouveau code de vérification est :</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">© 2024 Mobile API. Tous droits réservés.</p>
            </div>`
        });

        successResponse(res,{
            otpCode: process.env.NODE_ENV === "development" ? otp : undefined
        }, "Nouveau code otp envoyé");
    }catch(error){
        next(error);
    }
};

exports.connexion = async (req,res,next) => {
    try{
        const {email,password} = req.body;
        const utilisateur = await Utilisateur.findOne({email}).select('+password');
        if (!utilisateur || !(await utilisateur.comparePassword(password))){
            return errorResponse(res, "Email ou mot de passe incorrect.",400);
        }
        if (!utilisateur.isActive || !utilisateur.isVerified){
            return errorResponse(res, "Compte non vérifiée.\n Vérifiez votre email.",403);
        }
        utilisateur.lastLogin = Date.now();
        await utilisateur.save({validateBeforeSave: false});
        const token = generateToken(utilisateur._id);
        successResponse(res,{
            utilisateur: {
                id: utilisateur._id,
                email: utilisateur.email,
                nom: utilisateur.nom,
                prenom: utilisateur.prenom,
                phone: utilisateur.phone,
                avatar: utilisateur.avatar,
                isVerified: utilisateur.isVerified,
                nomComplet: utilisateur.nomComplet,
            },token
        }, "Connexion réussie.");
    }catch(error){
        next(error);
    }
};

exports.forgotPassword = async (req,res,next) => {
    try{
        const {email} = req.body;
        const utilisateur = await Utilisateur.findOne({email});
        if (!utilisateur){
            return successResponse(res,{}," Si cet email existe, un code de réinstalisation a été envoyé.");
        }
        const otp = utilisateur.generateResetOTP();
        await utilisateur.save({validateBeforeSave: false});
        await sendEmail({
            to: utilisateur.email,
            subject: 'Réinitialisation de votre mot de passe',
            text:`Bonjour ${utilisateur.prenom},\n\nVotre code de réinitialisation est : ${otp}\n\nCe code est valable pendant 10 minutes.\n\nCordialement,\nL'équipe Mobile API`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour <strong>${utilisateur.prenom}</strong>,</p>
            <p>Votre code de réinitialisation est :</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p>Ce code est valable pendant <strong>10 minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">© 2024 Mobile API. Tous droits réservés.</p>
            </div>`
        });

        successResponse(res,{
            email,
            resetOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        }, "Code de réinitialisation envoyé")
    }catch(error){
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otpCode, newPassword } = req.body;
        const utilisateur = await Utilisateur.findOne({ email }); // ← correction : Utilisateur avec majuscule
        if (!utilisateur) {
            return errorResponse(res, "Utilisateur non trouvé.", 404);
        }

        if (!utilisateur.verifyResetOTP(otpCode)) {  // ← correction : verifyResetOTP au lieu de verifyOTP
            return errorResponse(res, "Code invalide ou expiré.", 400);
        }

        utilisateur.password = newPassword;
        utilisateur.clearResetOTP();   // nettoie les champs resetOtp / resetOtpExpiresAt
        await utilisateur.save();
        successResponse(res, {}, "Mot de passe réinitialisé avec succès.");
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try{
        const {oldPassword, newPassword} = req.body;
        const utilisateur = await Utilisateur.findById(req.utilisateur._id).select('+password');
        if (!(await utilisateur.comparePassword(oldPassword))){
            return errorResponse(res, "Ancien mot de passe incorrect",400);
        }
        utilisateur.password = newPassword;
        await utilisateur.save();
        successResponse(res,{},'Mot de passe changé avec succès');
    }catch(error){
        next(error);
    }
};

exports.deconnexion = async (req, res) => {
    res.clearCookie('Authorization').status(200).json({success:true, message:'Déconnexion réussie'})
};

exports.getMe = async (req, res, next) => {
    try {
        const utilisateur = await Utilisateur.findById(req.utilisateur._id);
        successResponse(res, { utilisateur }, 'Profil recupere');
    } catch (error) {
        next(error);
    }
};

exports.deconnexion = async (req, res) => {
    successResponse(res, {}, 'Deconnexion reussie');
};