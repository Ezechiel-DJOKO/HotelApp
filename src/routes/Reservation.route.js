const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { protect, authorize } = require('../middleware/auth');
const { validateReservation } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestion des reservations
 */

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Creer une reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chambreId: { type: string }
 *               dateArrivee: { type: string, format: date }
 *               dateDepart: { type: string, format: date }
 *               voyageurs:
 *                 type: object
 *                 properties:
 *                   adultes: { type: integer }
 *                   enfants: { type: integer }
 *               demandesSpeciales: { type: string }
 *     responses:
 *       201:
 *         description: Reservation creee
 */
router.post('/', protect, validateReservation, reservationController.createReservation);
/**
 * @swagger
 * /reservations/mes-reservations:
 *   get:
 *     summary: Mes reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mes-reservations', protect, reservationController.getMesReservations);
/**
 * @swagger
 * /reservations/hotel/{hotelId}:
 *   get:
 *     summary: Reservations d'un hotel (owner/admin)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 */
router.get('/hotel/:hotelId', protect, authorize('owner', 'admin'), reservationController.getReservationsHotel);
/**
 * @swagger
 * /reservations/{id}/statut:
 *   put:
 *     summary: Changer le statut d'une reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: ['en_attente', 'confirmee', 'annulee', 'terminee'] }
 */
router.put('/:id/statut', protect, authorize('owner', 'admin'), reservationController.updateStatut);

module.exports = router;