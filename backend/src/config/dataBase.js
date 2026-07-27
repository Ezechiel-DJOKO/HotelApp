const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {});
        console.log(`MongoDB connecte : ${conn.connection.host}`);
        
        mongoose.connection.on('error', (err) => {
            console.error("Erreur MongoDB : ", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn("MongoDB deconnecte");
        });
        
    } catch (error) {
        console.error("Erreur de connexion a MongoDB : ", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;