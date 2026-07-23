require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/dataBase');
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Serveur demarre sur le port ${PORT}`);
        console.log(`Mode : ${process.env.NODE_ENV}`);
    });
});