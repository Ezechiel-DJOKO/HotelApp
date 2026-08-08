const express = require('express');
const router = express.Router();
const controller = require('../controllers/reversement.controller');
const { protect, authorize } = require('../middleware/auth');

// Owner
router.get('/mes-reversements', protect, controller.getMesReversements);
router.get('/receipt/:id', protect, controller.telechargerReleve);

// Admin uniquement
router.get('/hotels-a-verser', protect, authorize('admin'), controller.getHotelsAVerser);
router.get('/all', protect, authorize('admin'), controller.getAllReversements);
router.post('/effectuer', protect, authorize('admin'), controller.effectuerReversement);

module.exports = router;