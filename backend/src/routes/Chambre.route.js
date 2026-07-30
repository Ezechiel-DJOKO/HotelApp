const express = require('express');
const router = express.Router({ mergeParams: true });
const chambreController = require('../controllers/chambre.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateChambre } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Chambres
 *   description: Gestion des chambres
 */

/**
 * @swagger
 * /hotels/{hotelId}/chambres:
 *   get:
 *     summary: Liste des chambres d'un hotel
 *     tags: [Chambres]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema: { type: string }
 */
router.get('/', chambreController.getChambres);
/**
 * @swagger
 * /hotels/{hotelId}/chambres/disponibilite:
 *   get:
 *     summary: Verifier la disponibilite des chambres entre 2 dates
 *     tags: [Chambres]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: dateArrivee
 *         required: true
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateDepart
 *         required: true
 *         schema: { type: string, format: date }
 */
router.get('/disponibilite', chambreController.checkDisponibilite);
/**
 * @swagger
 * /hotels/{hotelId}/chambres:
 *   post:
 *     summary: Ajouter une chambre
 *     tags: [Chambres]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               type: { type: string }
 *               prixParNuit: { type: number }
 *               maxPersonnes: { type: integer }
 *               images: { type: array, items: { type: string, format: binary } }
 */
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 5), chambreController.createChambre);
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 5), chambreController.updateChambre);
router.delete('/:id', protect, authorize('owner', 'admin'), chambreController.deleteChambre);

module.exports = router;