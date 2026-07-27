const express = require('express');
const router = express.Router({ mergeParams: true });
const avisController = require('../controllers/avis.controller');
const { protect } = require('../middleware/auth');
const { validateAvis } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Avis
 *   description: Avis et notes
 */

/**
 * @swagger
 * /hotels/{hotelId}/avis:
 *   get:
 *     summary: Avis d'un hotel
 *     tags: [Avis]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 */

router.get('/', avisController.getAvisHotel);
/**
 * @swagger
 * /hotels/{hotelId}/avis:
 *   post:
 *     summary: Laisser un avis (sejour requis)
 *     tags: [Avis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note: { type: integer, minimum: 1, maximum: 5 }
 *               titre: { type: string }
 *               commentaire: { type: string }
 */
router.post('/', protect, validateAvis, avisController.createAvis);

module.exports = router;