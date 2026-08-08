const express = require('express');
const router = express.Router();
const controller = require('../controllers/demandeProprietaire.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Client
router.post(
    '/',
    protect,
    upload.fields([
        { name: 'pieceIdentite', maxCount: 1 },
        { name: 'rccm', maxCount: 1 }
    ]),
    controller.faireDemande
);
router.get('/mes-demandes', protect, controller.getMesDemandes);

// Admin
router.get('/', protect, authorize('admin'), controller.getAllDemandes);
router.get('/:id', protect, authorize('admin'), controller.getDemande);
router.put('/:id/approuver', protect, authorize('admin'), controller.approuverDemande);
router.put('/:id/refuser', protect, authorize('admin'), controller.refuserDemande);

module.exports = router;