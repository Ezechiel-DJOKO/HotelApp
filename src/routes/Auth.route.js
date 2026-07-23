const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const {
    validateInscription,
    validateConnexion,
    validateOTP,
    validateForgotPassword,
    validateResetPassword,
    validateChangePassword
} = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, password_confirm, nom, prenom]
 *             properties:
 *               email: { type: string, example: "john@example.com" }
 *               password: { type: string, example: "password123" }
 *               password_confirm: { type: string, example: "password123" }
 *               nom: { type: string, example: "Doe" }
 *               prenom: { type: string, example: "John" }
 *               phone: { type: string, example: "+229 97 00 00 00" }
 *     responses:
 *       201:
 *         description: Inscription reussie, OTP envoye
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Erreur de validation
 */
router.post('/register', validateInscription, authController.inscription);
/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verification du compte par OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otpCode: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Compte verifie, token JWT retourne
 */
router.post('/verify-otp', validateOTP, authController.verificationOTP);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion reussie
 */
router.post('/login', validateConnexion, authController.connexion);
/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Renvoyer un OTP
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 */
router.post('/resend-otp', validateForgotPassword, authController.renvoieOTP);
/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Demander une reinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 */
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reinitialiser le mot de passe avec OTP
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otpCode: { type: string }
 *               newPassword: { type: string }
 */
router.post('/reset-password', validateResetPassword, authController.resetPassword);
/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Changer le mot de passe (connecte)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 */
router.post('/change-password', protect, validateChangePassword, authController.changePassword);
/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Recuperer le profil connecte
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 */
router.get('/me', protect, authController.getMe);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Deconnexion
 *     tags: [Auth]
 */
router.post('/logout', authController.deconnexion);

module.exports = router;