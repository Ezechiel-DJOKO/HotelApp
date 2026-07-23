require('dotenv').config();
const connectDB = require('../config/dataBase');
const Hotel = require('../model/Hotel');
const Chambre = require('../model/Chambre');
const Utilisateur = require('../model/Utilisateur');

const seed = async () => {
    await connectDB();
    await Hotel.deleteMany();
    await Chambre.deleteMany();

    // Créer un admin si inexistant
    let admin = await Utilisateur.findOne({ email: 'admin@hotelbenin.bj' });
    if (!admin) {
        admin = await Utilisateur.create({
            nom: 'Admin', prenom: 'System', email: 'admin@hotelbenin.bj',
            password: 'password123', role: 'admin', isVerified: true, isActive: true
        });
    }

    const hotels = [
        {
            nom: 'Hotel du Lac Cotonou',
            description: 'Hôtel 4 étoiles en bordure de lagune avec piscine et restaurant.',
            type: 'hotel', etoiles: 4,
            adresse: 'Boulevard de la Marina', ville: 'Cotonou',
            localisation: { coordinates: [2.4403, 6.3654] },
            telephone: '+229 21 30 00 00', email: 'contact@hoteldulac.bj',
            equipements: ['wifi', 'piscine', 'restaurant', 'parking', 'climatisation'],
            fourchettePrix: { min: 35000, max: 150000 },
            proprietaire: admin._id,
            estVerifie: true,
        },
        {
            nom: 'Auberge de Grand-Popo',
            description: 'Auberge charmante les pieds dans l\'eau.',
            type: 'auberge', etoiles: 3,
            adresse: 'Route des Peupliers', ville: 'Comme',
            localisation: { coordinates: [1.8225, 6.2808] },
            telephone: '+229 23 44 55 66',
            equipements: ['wifi', 'restaurant', 'plage'],
            fourchettePrix: { min: 15000, max: 45000 },
            proprietaire: admin._id,
            estVerifie: true,
        },
        {
            nom: 'La Casa del Papa',
            description: 'Resort luxueux avec bungalows privés à Ouidah.',
            type: 'hotel', etoiles: 5,
            adresse: 'Route des Pêcheurs', ville: 'Ouidah',
            localisation: { coordinates: [2.0833, 6.3667] },
            telephone: '+229 23 40 00 00',
            equipements: ['wifi', 'piscine', 'spa', 'restaurant', 'plage privee'],
            fourchettePrix: { min: 50000, max: 250000 },
            proprietaire: admin._id,
            estVerifie: true,
        },
    ];

    const createdHotels = await Hotel.insertMany(hotels);

    for (const hotel of createdHotels) {
        await Chambre.insertMany([
            {
                hotel: hotel._id, nom: 'Chambre Standard', type: 'simple',
                prixParNuit: hotel.fourchettePrix.min, maxPersonnes: 1,
                typeLit: '1 lit simple', quantiteTotale: 5, quantiteDisponible: 5,
                equipements: ['wifi', 'climatisation', 'tv']
            },
            {
                hotel: hotel._id, nom: 'Chambre Double', type: 'double',
                prixParNuit: Math.round(hotel.fourchettePrix.min * 1.5), maxPersonnes: 2,
                typeLit: '1 lit double', quantiteTotale: 3, quantiteDisponible: 3,
                equipements: ['wifi', 'climatisation', 'tv', 'minibar']
            },
            {
                hotel: hotel._id, nom: 'Suite VIP', type: 'suite',
                prixParNuit: Math.round(hotel.fourchettePrix.max * 0.7), maxPersonnes: 4,
                typeLit: '1 lit king', quantiteTotale: 2, quantiteDisponible: 2,
                equipements: ['wifi', 'climatisation', 'tv', 'minibar', 'salon', 'balcon']
            }
        ]);
    }

    console.log('Seed terminé !');
    process.exit();
};

seed();