const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HotelBenin API',
            description: 'API backend pour application mobile d\'hebergement au Benin',
            version: '1.0.0',
            contact: {
                name: 'Orou Morou',
                email: 'oroumourouborgui@gmail.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Serveur de developpement'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Utilisateur: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64a1b2c3d4e5f6g7h8i9j0k1' },
                        email: { type: 'string', example: 'user@example.com' },
                        nom: { type: 'string', example: 'Doe' },
                        prenom: { type: 'string', example: 'John' },
                        phone: { type: 'string', example: '+229 97 00 00 00' },
                        avatar: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'owner', 'admin'] },
                        isVerified: { type: 'boolean' },
                        nomComplet: { type: 'string' }
                    }
                },
                Hotel: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        nom: { type: 'string', example: 'Hotel du Lac' },
                        slug: { type: 'string', example: 'hotel-du-lac' },
                        description: { type: 'string' },
                        type: { type: 'string', enum: ['hotel', 'auberge', 'residence', 'guesthouse', 'camping', 'appartement'] },
                        etoiles: { type: 'integer', minimum: 1, maximum: 5 },
                        adresse: { type: 'string' },
                        ville: { type: 'string', example: 'Cotonou' },
                        telephone: { type: 'string' },
                        email: { type: 'string' },
                        images: { type: 'array', items: { type: 'string' } },
                        equipements: { type: 'array', items: { type: 'string' } },
                        fourchettePrix: {
                            type: 'object',
                            properties: {
                                min: { type: 'number', example: 35000 },
                                max: { type: 'number', example: 150000 },
                                devise: { type: 'string', example: 'XOF' }
                            }
                        },
                        note: { type: 'number', example: 4.5 },
                        nombreAvis: { type: 'integer', example: 12 },
                        estVerifie: { type: 'boolean' },
                        estActif: { type: 'boolean' }
                    }
                },
                Chambre: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        nom: { type: 'string', example: 'Chambre Double' },
                        type: { type: 'string', enum: ['simple', 'double', 'twin', 'triple', 'suite', 'familiale', 'vip', 'presidentielle'] },
                        description: { type: 'string' },
                        prixParNuit: { type: 'number', example: 50000 },
                        devise: { type: 'string', example: 'XOF' },
                        maxPersonnes: { type: 'integer', example: 2 },
                        superficie: { type: 'number', example: 25 },
                        typeLit: { type: 'string', example: '1 lit king' },
                        images: { type: 'array', items: { type: 'string' } },
                        equipements: { type: 'array', items: { type: 'string' } },
                        quantiteTotale: { type: 'integer', example: 5 },
                        quantiteDisponible: { type: 'integer', example: 3 },
                        estDisponible: { type: 'boolean' }
                    }
                },
                Reservation: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        dateArrivee: { type: 'string', format: 'date-time' },
                        dateDepart: { type: 'string', format: 'date-time' },
                        voyageurs: {
                            type: 'object',
                            properties: {
                                adultes: { type: 'integer', example: 2 },
                                enfants: { type: 'integer', example: 0 }
                            }
                        },
                        prixTotal: { type: 'number', example: 100000 },
                        statut: { type: 'string', enum: ['en_attente', 'confirmee', 'annulee', 'terminee'] },
                        demandesSpeciales: { type: 'string' },
                        contact: {
                            type: 'object',
                            properties: {
                                nom: { type: 'string' },
                                email: { type: 'string' },
                                telephone: { type: 'string' }
                            }
                        }
                    }
                },
                Avis: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        note: { type: 'integer', minimum: 1, maximum: 5, example: 4 },
                        titre: { type: 'string', example: 'Excellent sejour' },
                        commentaire: { type: 'string', example: 'Tres bon hotel, personnel accueillant.' },
                        estVerifie: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                ApiResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        data: { type: 'object' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Erreur' }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentification et gestion des utilisateurs' },
            { name: 'Utilisateurs', description: 'Profil et gestion du compte' },
            { name: 'Hotels', description: 'Gestion des hotels et hebergements' },
            { name: 'Chambres', description: 'Gestion des chambres' },
            { name: 'Reservations', description: 'Reservations et disponibilites' },
            { name: 'Avis', description: 'Avis et notes des clients' }
        ]
    },
    apis: ['./src/route/*.js', './src/controller/*.js'] // chemins vers tes fichiers commentes
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;