const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/Auth.route');
const userRoutes = require('./routes/User.route');
const hotelRoutes = require('./routes/Hotel.route');
const chambreRoutes = require('./routes/Chambre.route');
const reservationRoutes = require('./routes/Reservation.route');
const avisRoutes = require('./routes/Avis.route');

const app = express();

// Securite
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Trop de requetes, reessayez plus tard' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Trop de tentatives, reessayez dans une heure' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'HotelBenin API Docs'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/hotels/:hotelId/chambres', chambreRoutes);
app.use('/api/hotels/:hotelId/avis', avisRoutes);
app.use('/api/reservations', reservationRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'HotelBenin API operationnelle',
        version: '1.0.0',
        env: process.env.NODE_ENV,
        docs: '/api-docs'
    });
});

// 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route non trouvee' });
});

app.use(errorHandler);

module.exports = app;