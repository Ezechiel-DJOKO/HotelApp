const express = require('express');
const router = express.Router();
const controller = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', controller.getMesNotifications);
router.put('/all-read', controller.marquerToutesLues);
router.delete('/read', controller.supprimerLues);
router.put('/:id/read', controller.marquerLue);
router.delete('/:id', controller.supprimer);

module.exports = router;