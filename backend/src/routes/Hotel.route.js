const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotel.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateHotel } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Gestion des hotels
 */

/**
 * @swagger
 * /hotels:
 *   get:
 *     summary: Liste des hotels avec filtres
 *     tags: [Hotels]
 *     parameters:
 *       - in: query
 *         name: ville
 *         schema: { type: string }
 *         example: Cotonou
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: minPrix
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrix
 *         schema: { type: number }
 *       - in: query
 *         name: etoiles
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: lat
 *         schema: { type: number }
 *       - in: query
 *         name: lng
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Liste des hotels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     hotels:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Hotel'
 */
router.get('/', hotelController.getHotels);
/**
 * @swagger
 * /hotels/villes:
 *   get:
 *     summary: Liste des villes disponibles
 *     tags: [Hotels]
 */
router.get('/villes', hotelController.getVilles);
/**
 * @swagger
 * /hotels/mes-hotels:
 *   get:
 *     summary: Hotels du proprietaire connecte
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mes-hotels', protect, authorize('owner', 'admin'), hotelController.getMesHotels);
/**
 * @swagger
 * /hotels/{slug}:
 *   get:
 *     summary: Detail d'un hotel
 *     tags: [Hotels]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Hotel trouve
 */
router.get('/:slug', hotelController.getHotel);
/**
 * @swagger
 * /hotels:
 *   post:
 *     summary: Creer un hotel (owner/admin)
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom: { type: string }
 *               description: { type: string }
 *               type: { type: string }
 *               etoiles: { type: integer }
 *               adresse: { type: string }
 *               ville: { type: string }
 *               telephone: { type: string }
 *               email: { type: string }
 *               images: { type: array, items: { type: string, format: binary } }
 *               fourchettePrix[min]: { type: number }
 *               fourchettePrix[max]: { type: number }
 *     responses:
 *       201:
 *         description: Hotel cree
 */
router.post('/', protect, authorize('owner', 'admin'), upload.array('images', 10), validateHotel, hotelController.createHotel);
/**
 * @swagger
 * /hotels/{id}:
 *   put:
 *     summary: Modifier un hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *   delete:
 *     summary: Supprimer un hotel
 *     tags: [Hotels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.put('/:id', protect, authorize('owner', 'admin'), upload.array('images', 10), hotelController.updateHotel);
router.delete('/:id', protect, authorize('owner', 'admin'), hotelController.deleteHotel);

module.exports = router;