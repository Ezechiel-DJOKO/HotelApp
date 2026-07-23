const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Profil et compte utilisateur
 */

/**
 * @swagger
 * /users/profil:
 *   get:
 *     summary: Mon profil
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profil', protect, userController.getProfil);
/**
 * @swagger
 * /users/profil:
 *   put:
 *     summary: Modifier mon profil
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/profil', protect, userController.updateProfil);
/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Uploader un avatar
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 */
router.post('/avatar', protect, upload.single('avatar'), userController.uploadAvatar);
/**
 * @swagger
 * /users/devenir-proprietaire:
 *   post:
 *     summary: Passer en mode proprietaire
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 */
router.post('/devenir-proprietaire', protect, userController.devenirProprietaire);
/**
 * @swagger
 * /users/mes-hotels:
 *   get:
 *     summary: Mes hotels (si proprietaire)
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mes-hotels', protect, userController.getMesHotels);
/**
 * @swagger
 * /users/supprimer-compte:
 *   delete:
 *     summary: Supprimer mon compte
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/supprimer-compte', protect, userController.supprimerCompte);

module.exports = router;