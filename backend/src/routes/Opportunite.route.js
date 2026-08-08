const express = require('express');
const router = express.Router();
const controller = require('../controllers/opportunite.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Client
router.post(
    '/',
    protect,
    upload.fields([
        { name: 'pieceIdentite', maxCount: 1 },
        { name: 'preuveFonds', maxCount: 1 },
        { name: 'businessPlan', maxCount: 1 },
        { name: 'rccm', maxCount: 1 },
        { name: 'preuveProriete', maxCount: 1 }
    ]),
    controller.creerOpportunite
);
router.get('/mes-opportunites', protect, controller.getMesOpportunites);

// Admin
router.get('/', protect, authorize('admin'), controller.getAllOpportunites);
router.get('/:id', protect, authorize('admin'), controller.getOpportunite);
router.put('/:id/statut', protect, authorize('admin'), controller.updateStatut);

module.exports = router;