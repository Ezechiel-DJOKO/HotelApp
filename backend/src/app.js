const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// ============================================
// IMPORTS DES ROUTES
// ============================================
const authRoutes = require('./routes/Auth.route');
const userRoutes = require('./routes/User.route');
const hotelRoutes = require('./routes/Hotel.route');
const chambreRoutes = require('./routes/Chambre.route');
const reservationRoutes = require('./routes/Reservation.route');
const avisRoutes = require('./routes/Avis.route');
const adminRoutes = require('./routes/Admin.route');
const notificationRoutes = require('./routes/Notification.route');
const paymentRoutes = require('./routes/Payment.route');
const reversementRoutes = require('./routes/Reversement.route');
const demandeProprietaireRoutes = require('./routes/DemandeProprietaire.route');
const opportuniteRoutes = require('./routes/Opportunite.route');

// ============================================
// CRÉER L'APP EXPRESS
// ============================================
const app = express();

// ============================================
// SERVIR LES IMAGES UPLOADÉES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// SÉCURITÉ
// ============================================
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// ============================================
// RATE LIMITING
// ============================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 100 : 10000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de requetes, reessayez plus tard' },
    skip: (req) => process.env.NODE_ENV !== 'production'
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 10 : 1000,
    message: { success: false, message: 'Trop de tentatives, reessayez dans une heure' },
    skip: (req) => process.env.NODE_ENV !== 'production'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ============================================
// PARSERS
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// DOCUMENTATION SWAGGER
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HotelBenin API Docs'
}));

// ============================================
// ROUTES (⭐ TOUTES ICI, AVANT le 404)
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:hotelId/chambres', chambreRoutes);
app.use('/api/hotels/:hotelId/avis', avisRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);  // ⭐ ICI, PAS APRÈS LE 404
app.use('/api/reversements', reversementRoutes);
app.use('/api/demandes-proprietaire', demandeProprietaireRoutes);
app.use('/api/opportunites', opportuniteRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
    res.json({
        message: 'HotelBenin API operationnelle',
        version: '1.0.0',
        env: process.env.NODE_ENV,
        docs: '/api-docs'
    });
});

// ============================================
// 404 (⚠️ TOUJOURS EN AVANT-DERNIER)
// ============================================
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvee' });
});

// ============================================
// ERROR HANDLER (⚠️ TOUJOURS EN DERNIER)
// ============================================
app.use(errorHandler);

module.exports = app;