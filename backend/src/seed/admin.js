require('dotenv').config();
const mongoose = require('mongoose');
const Utilisateur = require('../model/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connecté');

        // Vérifie si un admin existe déjà
        const existingAdmin = await Utilisateur.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Un admin existe déjà :');
            console.log('   Email :', existingAdmin.email);
            console.log('   Nom   :', existingAdmin.nomComplet);
            process.exit(0);
        }

        // Créer l'admin
        const admin = await Utilisateur.create({
            email: 'admin@hotelbenin.bj',
            password: 'Admin@2025!',
            nom: 'Admin',
            prenom: 'Super',
            phone: '+229 00000000',
            role: 'admin',
            isVerified: true,
            isActive: true,
            isAdmin: true
        });

        console.log('');
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   ✅ ADMIN CRÉÉ AVEC SUCCÈS                ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log('║   📧 Email    : admin@hotelbenin.bj        ║');
        console.log('║   🔑 Password : Admin@2025!                ║');
        console.log('║                                            ║');
        console.log('║   ⚠️  CHANGE LE MOT DE PASSE APRÈS         ║');
        console.log('║       LA PREMIÈRE CONNEXION !              ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur :', error.message);
        process.exit(1);
    }
};

seedAdmin();