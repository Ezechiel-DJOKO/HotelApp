const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

// Routes protégées (client)
router.post('/initier', protect, paymentController.initierPaiement);
router.post('/confirmer', protect, paymentController.confirmerPaiement);
router.get('/receipt/:id', protect, paymentController.telechargerRecu);
router.get('/mes-paiements', protect, paymentController.getMesPaiements);

// Routes owner
router.get('/mes-revenus', protect, authorize('owner', 'admin'), paymentController.getMesRevenus);

// Routes admin
router.get('/all', protect, authorize('admin'), paymentController.getAllTransactions);

module.exports = router;