require('dotenv').config();

const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/dataBase');
const { initSocketIO } = require('./src/util/notificationService');

const PORT = process.env.PORT || 5000;

// Créer le serveur HTTP
const server = http.createServer(app);

// ============================================
// SOCKET.IO
// ============================================
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }
});

// Authentification Socket.IO via JWT
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Token manquant'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        next(new Error('Token invalide'));
    }
});

// Gestion des connexions
io.on('connection', (socket) => {
    console.log(`🔌 Socket connecté: ${socket.id} - User: ${socket.userId}`);
    
    // Chaque user rejoint sa propre "room" pour recevoir ses notifs
    socket.join(`user:${socket.userId}`);
    
    socket.on('disconnect', () => {
        console.log(`🔌 Socket déconnecté: ${socket.id}`);
    });
});

// Passer io au service de notifications
initSocketIO(io);

// ============================================
// LANCER LE SERVEUR
// ============================================
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Serveur demarre sur le port ${PORT}`);
        console.log(`Mode : ${process.env.NODE_ENV}`);
        console.log(`🔔 Socket.IO activé`);
    });
});