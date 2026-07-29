const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const adminController = require('../controllers/admin.controller');

// Toutes les routes ci-dessous nécessitent d'être admin
router.use(protect, authorize('admin'));

// ============================================
// STATISTIQUES DASHBOARD
// ============================================
router.get('/stats', adminController.getStats);

// ============================================
// GESTION DES HÔTELS + OWNERS
// ============================================
// Créer un hôtel ET son owner en une fois
router.post('/hotels/create-with-owner', upload.array('images', 10), adminController.createHotelWithOwner);

// Liste de tous les hôtels (avec info owner)
router.get('/hotels', adminController.getAllHotels);

// Vérifier / Activer / Désactiver un hôtel
router.put('/hotels/:id/verify', adminController.verifyHotel);
router.put('/hotels/:id/toggle-active', adminController.toggleHotelActive);

// ============================================
// GESTION DES UTILISATEURS
// ============================================
// Liste des owners
router.get('/owners', adminController.getAllOwners);

// Liste des clients
router.get('/clients', adminController.getAllClients);

// Détail utilisateur
router.get('/users/:id', adminController.getUserById);

// Bloquer / Débloquer un utilisateur
router.put('/users/:id/toggle-active', adminController.toggleUserActive);

// Supprimer un utilisateur
router.delete('/users/:id', adminController.deleteUser);

router.post('/hotels/create-with-owner', upload.array('images', 10), adminController.createHotelWithOwner);

// ============================================
// GESTION DES RÉSERVATIONS
// ============================================
router.get('/reservations', adminController.getAllReservations);

module.exports = router;