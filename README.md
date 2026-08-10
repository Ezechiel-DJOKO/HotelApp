# 🏨 HotelBenin - Plateforme de Réservation d'Hôtels au Bénin

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-black?logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> La 1ère plateforme d'hébergement au Bénin 🇧🇯  
> Réservez facilement les meilleurs hôtels, auberges et résidences du pays.

---

## 📸 Captures d'écran

### Page d'accueil
![Accueil](screenshots/accueil.png)

### Dashboard Admin
![Admin](screenshots/admin-dashboard.png)

### Dashboard Propriétaire
![Owner](screenshots/owner-dashboard.png)

### Réservation & Paiement
![Paiement](screenshots/paiement.png)

---

## 📋 Table des matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Lancement](#-lancement)
- [Structure du projet](#-structure-du-projet)
- [Les 3 types d'utilisateurs](#-les-3-types-dutilisateurs)
- [Système de paiement](#-système-de-paiement)
- [Système de commissions](#-système-de-commissions)
- [Notifications en temps réel](#-notifications-en-temps-réel)
- [Génération de PDF](#-génération-de-pdf)
- [Mode sombre](#-mode-sombre)
- [PWA](#-progressive-web-app)
- [API Documentation](#-api-documentation)
- [Déploiement](#-déploiement)
- [Variables d'environnement](#-variables-denvironnement)
- [Contributeurs](#-contributeurs)
- [Licence](#-licence)

---

## 🎯 Présentation

**HotelBenin** est une plateforme web complète de réservation d'hôtels au Bénin. Elle connecte les voyageurs avec les hôteliers et permet de :

- 🔍 **Chercher et filtrer** des hôtels par ville, type, étoiles, prix
- 📅 **Réserver** des chambres avec dates et nombre de voyageurs
- 💳 **Payer en ligne** via Mobile Money (MTN, Moov, Orange) ou carte bancaire
- 📄 **Recevoir un reçu PDF** par email avec QR Code
- ⭐ **Laisser des avis** après un séjour
- 🔔 **Notifications en temps réel** via Socket.IO
- 📊 **Tableaux de bord** avec graphiques (Chart.js) pour chaque acteur

La plateforme fonctionne comme un **intermédiaire** (modèle Booking.com) :
- Le client paye 100% du montant
- HotelBenin prélève une commission (10% ou 15%)
- Le reste est reversé au propriétaire de l'hôtel

---

## ✨ Fonctionnalités

### 🌍 Pages publiques
| Fonctionnalité | Description |
|---|---|
| Page d'accueil | Hero avec recherche, hôtels populaires, CTA |
| Liste des hôtels | Filtres (ville, type, étoiles, prix), grille responsive |
| Détail hôtel | Galerie photos avec lightbox, chambres, avis, contact |
| Inscription | Création de compte client avec vérification OTP par email |
| Connexion | Multi-rôles (admin, owner, client) avec redirection automatique |
| Mot de passe oublié | Réinitialisation par code OTP |

### 🛡️ Espace Administrateur
| Fonctionnalité | Description |
|---|---|
| Dashboard | Statistiques globales + graphiques (Chart.js) |
| Gestion hôtels | CRUD complet, vérification, activation/désactivation, suppression cascade |
| Création hôtel + propriétaire | Crée l'hôtel ET le compte owner en une fois (email auto avec identifiants) |
| Gestion propriétaires | Liste, détail, bloquer/débloquer, supprimer |
| Gestion clients | Liste, détail, bloquer/débloquer, supprimer |
| Réservations | Vue de toutes les réservations |
| Transactions | Vue de tous les paiements avec commissions |
| Reversements | Payer les hôteliers + relevé PDF + notification |
| Vérifications | Hôtels en attente de vérification |
| Opportunités | Demandes d'investissement (propriétaire, partenaire, construction) |
| Demandes propriétaires | Valider les demandes de clients qui veulent devenir owner |
| Profil admin | Photo, infos, sécurité renforcée |

### 🏨 Espace Propriétaire (Owner)
| Fonctionnalité | Description |
|---|---|
| Dashboard | Stats + graphiques de l'hôtel |
| Mon hôtel | Voir et modifier les informations + galerie photos |
| Mes chambres | CRUD complet (ajout, modification, suppression) |
| Réservations | Confirmer, refuser, marquer terminée |
| Mes revenus | Suivi des gains, commissions, reversements |
| Statistiques | Graphiques d'évolution (Chart.js) |
| Profil | Photo, infos personnelles |

### 👤 Espace Client
| Fonctionnalité | Description |
|---|---|
| Mes réservations | Suivi avec filtres par statut |
| Paiement | MTN MoMo, Moov Money, Orange Money, Wave, Visa, Mastercard |
| Reçu PDF | Généré automatiquement avec QR Code, envoyé par email |
| Favoris | Sauvegarder des hôtels (localStorage) |
| Avis | Laisser un avis après un séjour terminé |
| Investir | Hub avec 3 options (propriétaire, partenaire, construction) |
| Devenir propriétaire | Choisir un hôtel existant ou proposer un non-listé |
| Devenir partenaire | Sponsoriser/investir dans un hôtel |
| Construire un hôtel | Accompagnement de A à Z par HotelBenin |
| Profil | Photo, infos, badge de vérification |

### 🔧 Système
| Fonctionnalité | Description |
|---|---|
| Notifications temps réel | Socket.IO (nouvelle réservation, confirmation, paiement, etc.) |
| Emails automatiques | OTP, bienvenue, confirmation, reçu PDF, reversement |
| Mode sombre | Toggle lune/soleil dans le header |
| Multilingue | Google Translate (FR, EN, ES, etc.) |
| PWA | Installable sur mobile comme une app native |
| Graphiques | Chart.js (courbes, donuts, barres) |
| Upload fichiers | Images, PDF, ZIP (Multer + stockage local) |
| Validation email | deep-email-validator (format + DNS) |

---

## 🏗️ Architecture technique

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (Next.js 16) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Public │ │ Client │ │ Owner │ │ Admin │ │
│ │ (bleu) │ │ (bleu) │ │ (violet) │ │ (rouge) │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ │ │
│ ┌─────────┴─────────┐ │
│ │ Zustand Store │ │
│ │ (Auth, Theme, │ │
│ │ Preferences) │ │
│ └─────────┬─────────┘ │
│ │ Axios + JWT │
├────────────────────────┼────────────────────────────────────┤
│ BACKEND (Express.js) │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Auth │ │ Hotels │ │ Payments │ │ Socket │ │
│ │Controller│ │Controller│ │Controller│ │ .IO │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│ │ │
│ ┌─────────┴─────────┐ │
│ │ MongoDB │ │
│ │ (Mongoose ODM) │ │
│ └───────────────────┘ │
│ │ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ PDFKit │ │ QRCode │ │Nodemailer│ │ Multer │ │
│ │ (Reçus) │ │(QR codes)│ │ (Emails) │ │ (Upload) │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────┘



---

## 🛠️ Technologies utilisées

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| Next.js | 16.x | Framework React (App Router) |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Styles utilitaires |
| Zustand | 5.x | Gestion d'état global |
| Axios | 1.x | Requêtes HTTP |
| Chart.js | 4.x | Graphiques |
| react-chartjs-2 | 5.x | Wrapper React pour Chart.js |
| react-hot-toast | 2.x | Notifications toast |
| lucide-react | 0.x | Icônes |
| socket.io-client | 4.x | Temps réel côté client |
| next-pwa | 5.x | Progressive Web App |
| js-cookie | 3.x | Gestion des cookies |

### Backend
| Technologie | Version | Usage |
|---|---|---|
| Node.js | 18+ | Runtime JavaScript |
| Express.js | 4.x | Framework serveur |
| MongoDB | 7.x | Base de données NoSQL |
| Mongoose | 8.x | ODM MongoDB |
| Socket.IO | 4.x | WebSocket temps réel |
| JSON Web Token | 9.x | Authentification |
| bcryptjs | 2.x | Hash des mots de passe |
| Nodemailer | 6.x | Envoi d'emails |
| PDFKit | 0.x | Génération de PDF |
| QRCode | 1.x | Génération de QR codes |
| Multer | 1.x | Upload de fichiers |
| deep-email-validator | 0.x | Validation d'emails |
| slugify | 1.x | Génération de slugs URL |
| uuid | 10.x | Identifiants uniques |
| Helmet | 7.x | Sécurité HTTP |
| CORS | 2.x | Cross-Origin Resource Sharing |
| express-rate-limit | 7.x | Protection anti-spam |

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** v18 ou supérieur → [Télécharger](https://nodejs.org/)
- **Docker** (pour MongoDB) → [Télécharger](https://docs.docker.com/get-docker/)
- **Git** → [Télécharger](https://git-scm.com/)
- **Un compte Gmail** (pour l'envoi d'emails)

### Vérifier les installations

```bash
node --version    # v18+
npm --version     # v9+
docker --version  # v20+
git --version     # v2+



🚀 Installation
1. Cloner le projet

Bash

git clone https://github.com/votre-username/HotelApp.git
cd HotelApp

2. Installer les dépendances backend

Bash

cd backend
npm install

3. Installer les dépendances frontend

Bash

cd ../frontend
npm install

4. Lancer MongoDB (Docker)

Bash

docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  --restart unless-stopped \
  mongo:7

5. Vérifier que MongoDB tourne

Bash

docker ps
# Vous devez voir "mongodb" dans la liste


⚙️ Configuration
Backend (.env)

Créez le fichier backend/.env :

Bash

cp backend/.env.example backend/.env

Puis modifiez avec vos vraies valeurs :

env

# ============================================
# SERVEUR
# ============================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# ============================================
# BASE DE DONNÉES
# ============================================
MONGODB_URI=mongodb://localhost:27017/hotelbenin

# ============================================
# AUTHENTIFICATION
# ============================================
JWT_SECRET=votre_secret_jwt_super_long_et_complexe_minimum_32_caracteres
JWT_EXPIRES_IN=7d

# ============================================
# EMAIL (Gmail App Password)
# ============================================
# 1. Activez la validation en 2 étapes sur votre compte Google
# 2. Créez un mot de passe d'application sur https://myaccount.google.com/apppasswords
# 3. Utilisez ce mot de passe ci-dessous (16 caractères, sans espaces)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app_16_caracteres
EMAIL_FROM=HotelBenin <votre_email@gmail.com>

# ============================================
# PAIEMENT
# ============================================
# Mode: 'demo' (simulation) | 'sandbox' (CinetPay test) | 'live' (production)
PAYMENT_MODE=demo

# CinetPay (à remplir quand vous avez un compte)
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
CINETPAY_ENV=sandbox

# ============================================
# COMMISSIONS
# ============================================
COMMISSION_STANDARD=10
COMMISSION_PREMIUM=15


Frontend (.env.local)

Créez le fichier frontend/.env.local :

env

NEXT_PUBLIC_API_URL=http://localhost:5000/api


▶️ Lancement

Terminal 1 : Backend

Bash

cd backend
npm start

Vous devez voir :

text

✅ Notification service : Socket.IO connecté
MongoDB connecte : localhost
Serveur demarre sur le port 5000
Mode : development
🔔 Socket.IO activé

Terminal 2 : Frontend

Bash

cd frontend
npm run dev

Vous devez voir :

text

▲ Next.js 16.x.x (Turbopack)
- Local: http://localhost:3000
✓ Ready in XXXms

Terminal 3 (optionnel) : MongoDB Shell

Bash

docker exec -it mongodb mongosh

Créer le compte administrateur

Bash

cd backend
node src/seed/admin.js

Résultat :

text

╔════════════════════════════════════════════╗
║   ✅ ADMIN CRÉÉ AVEC SUCCÈS                ║
╠════════════════════════════════════════════╣
║   📧 Email    : admin@hotelbenin.bj        ║
║   🔑 Password : Admin@2025!                ║
║                                            ║
║   ⚠️  CHANGEZ LE MOT DE PASSE APRÈS        ║
║       LA PREMIÈRE CONNEXION !              ║
╚════════════════════════════════════════════╝

Accéder à l'application

    Frontend : http://localhost:3000
    Backend API : http://localhost:5000
    Swagger Docs : http://localhost:5000/api-docs



📁 Structure du projet

HotelApp/
├── backend/                          # API Node.js/Express
│   ├── receipts/                     # Reçus PDF générés
│   ├── releves/                      # Relevés de reversement PDF
│   ├── uploads/                      # Fichiers uploadés (images, PDF, ZIP)
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js         # Config Cloudinary (non utilisé en local)
│   │   │   ├── dataBase.js           # Connexion MongoDB
│   │   │   ├── email.js              # Config Nodemailer
│   │   │   └── swagger.js            # Documentation Swagger
│   │   ├── controllers/
│   │   │   ├── admin.controller.js   # Gestion admin (hôtels, users, stats)
│   │   │   ├── auth.controller.js    # Inscription, connexion, OTP, reset password
│   │   │   ├── avis.controller.js    # Avis des clients
│   │   │   ├── chambre.controller.js # CRUD chambres
│   │   │   ├── demandeProprietaire.controller.js # Demandes devenir owner
│   │   │   ├── hotel.controller.js   # CRUD hôtels
│   │   │   ├── notification.controller.js # Notifications
│   │   │   ├── opportunite.controller.js  # Investissements
│   │   │   ├── payment.controller.js # Paiements + reçu PDF
│   │   │   ├── reservation.controller.js  # Réservations
│   │   │   ├── reversement.controller.js  # Reversements aux hôtels
│   │   │   └── user.controller.js    # Profil, avatar, devenir proprio
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verify + authorize roles
│   │   │   ├── errorHandler.js       # Gestion globale des erreurs
│   │   │   ├── upload.js             # Multer (images, PDF, ZIP)
│   │   │   └── validator.js          # Validation Joi
│   │   ├── model/
│   │   │   ├── Avis.js               # Modèle avis
│   │   │   ├── Chambre.js            # Modèle chambre
│   │   │   ├── DemandeProprietaire.js # Modèle demande propriétaire
│   │   │   ├── Hotel.js              # Modèle hôtel
│   │   │   ├── Notification.js       # Modèle notification
│   │   │   ├── Opportunite.js        # Modèle opportunité investissement
│   │   │   ├── Paiement.js           # Modèle paiement (legacy)
│   │   │   ├── Reservations.js       # Modèle réservation
│   │   │   ├── Reversement.js        # Modèle reversement
│   │   │   ├── Transaction.js        # Modèle transaction
│   │   │   └── User.js              # Modèle utilisateur
│   │   ├── routes/
│   │   │   ├── Admin.route.js
│   │   │   ├── Auth.route.js
│   │   │   ├── Avis.route.js
│   │   │   ├── Chambre.route.js
│   │   │   ├── DemandeProprietaire.route.js
│   │   │   ├── Hotel.route.js
│   │   │   ├── Notification.route.js
│   │   │   ├── Opportunite.route.js
│   │   │   ├── Payment.route.js
│   │   │   ├── Reservation.route.js
│   │   │   ├── Reversement.route.js
│   │   │   └── User.route.js
│   │   ├── seed/
│   │   │   ├── admin.js              # Script création admin
│   │   │   └── hotel.js              # Script données de test
│   │   ├── util/
│   │   │   ├── apiResponse.js        # Formatage réponses API
│   │   │   ├── commissionCalculator.js # Calcul commissions
│   │   │   ├── emailValidator.js     # Validation email profonde
│   │   │   ├── generateOTP.js        # Génération OTP
│   │   │   ├── notificationService.js # Service notifications Socket.IO
│   │   │   ├── paymentSimulator.js   # Simulation paiement (mode démo)
│   │   │   ├── pdfGenerator.js       # Génération reçu PDF
│   │   │   ├── relevePdfGenerator.js # Génération relevé reversement
│   │   │   └── sendEmail.js          # Envoi d'emails
│   │   └── app.js                    # Configuration Express
│   ├── server.js                     # Point d'entrée + Socket.IO
│   ├── package.json
│   └── .env                          # Variables d'environnement (NE PAS COMMITER)
│
├── frontend/                         # Application Next.js
│   ├── public/
│   │   ├── icons/                    # Icônes PWA
│   │   ├── manifest.json             # Manifest PWA
│   │   └── favicon.ico
│   ├── messages/
│   │   ├── fr.json                   # Traductions français
│   │   └── en.json                   # Traductions anglais
│   ├── scripts/
│   │   └── generate-icons.js         # Génération icônes PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Page d'accueil
│   │   │   ├── layout.tsx            # Layout racine
│   │   │   ├── globals.css           # Styles globaux + dark mode
│   │   │   ├── auth/                 # Pages authentification
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── verify-otp/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   ├── hotels/               # Pages publiques hôtels
│   │   │   │   ├── page.tsx          # Liste
│   │   │   │   └── [slug]/page.tsx   # Détail
│   │   │   ├── client/               # Espace client (bleu)
│   │   │   ├── owner/                # Espace propriétaire (violet)
│   │   │   ├── admin/                # Espace admin (rouge)
│   │   │   ├── notifications/        # Page notifications
│   │   │   ├── aide/                 # Page aide/support
│   │   │   └── parametres/           # Page paramètres
│   │   ├── components/
│   │   │   ├── shared/               # Composants partagés
│   │   │   │   ├── ui/               # Design system (Button, Card, Input, etc.)
│   │   │   │   ├── public/           # Navbar, Footer, HotelCard
│   │   │   │   ├── charts/           # LineChart, DoughnutChart, BarChart
│   │   │   │   └── notifications/    # NotificationBell
│   │   │   ├── client/               # Composants client
│   │   │   │   ├── layout/           # ClientSidebar, ClientHeader
│   │   │   │   ├── hotels/           # FavoriteButton, ChambreCardPublic
│   │   │   │   ├── reservations/     # ReservationForm
│   │   │   │   ├── payment/          # PaymentModal
│   │   │   │   └── avis/             # AvisCard, AvisForm, AvisSection
│   │   │   ├── owner/                # Composants propriétaire
│   │   │   │   ├── layout/           # OwnerSidebar, OwnerHeader
│   │   │   │   └── chambres/         # ChambreForm
│   │   │   └── admin/                # Composants admin
│   │   │       ├── layout/           # AdminSidebar, AdminHeader
│   │   │       └── hotels/           # CreateHotelWithOwnerForm, DeleteHotelModal
│   │   ├── hooks/
│   │   │   └── useNotifications.tsx  # Hook notifications temps réel
│   │   ├── lib/
│   │   │   ├── axios.ts              # Client HTTP configuré
│   │   │   └── socket.ts             # Client Socket.IO
│   │   ├── services/
│   │   │   ├── admin.service.ts      # API admin
│   │   │   ├── auth.service.ts       # API auth
│   │   │   ├── avis.service.ts       # API avis
│   │   │   ├── chambre.service.ts    # API chambres
│   │   │   ├── demandeProprietaire.service.ts
│   │   │   ├── hotel.service.ts      # API hôtels
│   │   │   ├── notification.service.ts
│   │   │   ├── opportunite.service.ts
│   │   │   ├── owner.service.ts      # API owner
│   │   │   ├── payment.service.ts    # API paiements
│   │   │   ├── reservation.service.ts
│   │   │   ├── reversement.service.ts
│   │   │   └── user.service.ts       # API profil
│   │   ├── store/
│   │   │   ├── authStore.ts          # État authentification (Zustand)
│   │   │   ├── languageStore.ts      # État langue
│   │   │   ├── notificationStore.ts  # État notifications
│   │   │   ├── preferencesStore.ts   # Préférences utilisateur
│   │   │   └── themeStore.ts         # État thème (dark/light)
│   │   └── types/
│   │       └── index.ts              # Types TypeScript
│   ├── next.config.ts                # Configuration Next.js + PWA
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local                    # Variables frontend
│
├── README.md                         # Ce fichier
├── .gitignore
└── LICENSE


👥 Les 3 types d'utilisateurs
🛡️ Administrateur (Admin)

    Créé : Via script seed (node src/seed/admin.js)
    Rôle : Gère toute la plateforme
    Couleur : Rouge/Orange
    Accès : /admin/*
    Peut : Créer des hôtels + owners, gérer les utilisateurs, effectuer les reversements, valider les demandes

🏨 Propriétaire (Owner)

    Créé : Par l'admin (qui crée l'hôtel et le compte owner en même temps)
    Rôle : Gère son hôtel
    Couleur : Violet/Rose
    Accès : /owner/*
    Peut : Modifier son hôtel, gérer ses chambres, confirmer/refuser les réservations, voir ses revenus

👤 Client (User)

    Créé : S'inscrit lui-même via /auth/register
    Rôle : Réserve des hôtels
    Couleur : Bleu/Cyan
    Accès : /client/*
    Peut : Chercher des hôtels, réserver, payer, laisser des avis, devenir propriétaire/partenaire


💳 Système de paiement
Mode DÉMO (actuel)

    Simulation de paiement (aucun débit réel)
    6 méthodes : MTN MoMo, Moov Money, Orange Money, Wave, Visa, Mastercard
    Reçu PDF généré automatiquement avec QR Code
    Email envoyé au client avec PDF en pièce jointe

Mode SANDBOX (CinetPay)

    Paiements test via CinetPay
    Mêmes fonctionnalités que le mode live
    Aucun argent réel ne circule

Mode LIVE (production)

    Vrais paiements via CinetPay
    Configuration dans .env : PAYMENT_MODE=live

Flux de paiement

text

1. Client réserve → Réservation créée (statut: "en_attente")
2. Client paye → Paiement traité → Réservation (statut: "payée")
3. Owner confirme → Réservation (statut: "confirmée")
4. Séjour terminé → Owner marque "terminée"
5. Client peut laisser un avis



💰 Système de commissions

Étoiles	Commission HotelBenin	Part hôtelier
1 à 4 ⭐	10%	90%
5 ⭐⭐⭐⭐⭐	15%	85%
Exemple

Un client paie 150 000 XOF pour un hôtel 3 étoiles :

    Commission HotelBenin : 15 000 XOF (10%)
    Reversement à l'hôtel : 135 000 XOF (90%)

Les reversements sont effectués par l'admin chaque semaine via Mobile Money ou virement bancaire.


🔔 Notifications en temps réel

Le système utilise Socket.IO pour les notifications instantanées :
Événement	Destinataire	Notification
Nouvelle réservation	Owner	"🆕 Nouvelle réservation !"
Paiement reçu	Client + Owner	"💰 Paiement confirmé !"
Réservation confirmée	Client	"✅ Réservation confirmée !"
Réservation annulée	Client	"❌ Réservation annulée"
Séjour terminé	Client	"⭐ Laissez un avis !"
Nouvel avis	Owner	"⭐ Nouvel avis reçu"
Nouveau client inscrit	Admin	"👤 Nouveau client"



📄 Génération de PDF
Reçu de paiement

    Généré avec PDFKit
    Contient : header, infos client, détails séjour, QR Code, montant
    Envoyé par email en pièce jointe
    Téléchargeable depuis le dashboard client

Relevé de reversement

    Généré pour chaque reversement aux hôteliers
    Contient : liste des transactions, montants, commissions


🌙 Mode sombre

    Toggle lune/soleil 🌙☀️ dans le header de chaque page
    Sauvegardé dans localStorage (persiste entre les sessions)
    3 modes : Clair, Sombre, Automatique (suit le système)
    Compatible avec tous les composants et pages


📱 Progressive Web App

L'application est une PWA installable :

    Icône sur l'écran d'accueil
    Fonctionne hors ligne (cache)
    Notifications push
    Look d'app native (plein écran)

Installer la PWA

    Ouvrez l'application dans Chrome
    Cliquez sur l'icône ⊕ dans la barre d'adresse
    Ou attendez le popup "Installer HotelBenin"


📚 API Documentation

La documentation Swagger est disponible sur :

http://localhost:5000/api-docs



Principales routes API

# Auth
POST   /api/auth/register          # Inscription
POST   /api/auth/login             # Connexion
POST   /api/auth/verify-otp        # Vérification OTP
POST   /api/auth/forgot-password   # Mot de passe oublié
POST   /api/auth/reset-password    # Réinitialiser le mot de passe

# Hotels
GET    /api/hotels                 # Liste des hôtels (public)
GET    /api/hotels/:slug           # Détail hôtel (public)
GET    /api/hotels/mes-hotels      # Mes hôtels (owner)
POST   /api/hotels                 # Créer un hôtel (owner/admin)
PUT    /api/hotels/:id             # Modifier un hôtel
DELETE /api/hotels/:id             # Supprimer un hôtel

# Chambres
GET    /api/hotels/:hotelId/chambres          # Chambres d'un hôtel
POST   /api/hotels/:hotelId/chambres          # Ajouter une chambre
PUT    /api/hotels/:hotelId/chambres/:id      # Modifier une chambre
DELETE /api/hotels/:hotelId/chambres/:id      # Supprimer une chambre

# Réservations
POST   /api/reservations                      # Créer une réservation
GET    /api/reservations/mes-reservations      # Mes réservations (client)
GET    /api/reservations/hotel/:hotelId        # Réservations d'un hôtel (owner)
PUT    /api/reservations/:id/statut            # Changer le statut

# Paiements
POST   /api/payments/initier                  # Initier un paiement
POST   /api/payments/confirmer                # Confirmer un paiement
GET    /api/payments/receipt/:id              # Télécharger le reçu PDF
GET    /api/payments/mes-paiements            # Historique paiements (client)
GET    /api/payments/mes-revenus              # Mes revenus (owner)

# Admin
GET    /api/admin/stats                       # Statistiques globales
POST   /api/admin/hotels/create-with-owner    # Créer hôtel + owner
GET    /api/admin/hotels                      # Tous les hôtels
GET    /api/admin/owners                      # Tous les propriétaires
GET    /api/admin/clients                     # Tous les clients
DELETE /api/admin/hotels/:id                  # Supprimer un hôtel (cascade)

# Notifications
GET    /api/notifications                     # Mes notifications
PUT    /api/notifications/all-read            # Tout marquer lu
PUT    /api/notifications/:id/read            # Marquer une comme lue

# Reversements
GET    /api/reversements/hotels-a-verser      # Hôtels à payer (admin)
POST   /api/reversements/effectuer            # Effectuer un reversement
GET    /api/reversements/mes-reversements      # Mes reversements (owner)

# Opportunités
POST   /api/opportunites                      # Créer une demande
GET    /api/opportunites/mes-opportunites      # Mes demandes (client)
GET    /api/opportunites                      # Toutes les demandes (admin)
PUT    /api/opportunites/:id/statut            # Approuver/refuser (admin)


🌐 Déploiement
Frontend → Vercel (gratuit)

Bash

cd frontend
npx vercel --prod

Backend → Railway ou Render

    Créez un compte sur Railway ou Render
    Connectez votre repository GitHub
    Configurez les variables d'environnement
    Déployez

Base de données → MongoDB Atlas

    Créez un compte sur MongoDB Atlas
    Créez un cluster gratuit (M0)
    Copiez l'URI de connexion
    Mettez-la dans MONGODB_URI

Domaine (optionnel)

Achetez un domaine .bj sur un registrar béninois et pointez-le vers votre serveur.


🔐 Variables d'environnement
Backend (.env)
Variable	Description	Requis	Exemple
PORT	Port du serveur	✅	5000
NODE_ENV	Environnement	✅	development ou production
FRONTEND_URL	URL du frontend	✅	http://localhost:3000
BACKEND_URL	URL du backend	✅	http://localhost:5000
MONGODB_URI	URI MongoDB	✅	mongodb://localhost:27017/hotelbenin
JWT_SECRET	Secret JWT (32+ caractères)	✅	votre_secret_super_long
JWT_EXPIRES_IN	Durée du token	✅	7d
EMAIL_HOST	Serveur SMTP	✅	smtp.gmail.com
EMAIL_PORT	Port SMTP	✅	587
EMAIL_USER	Email d'envoi	✅	votre@gmail.com
EMAIL_PASS	Mot de passe app Gmail	✅	abcdefghijklmnop
EMAIL_FROM	Nom d'affichage	✅	HotelBenin <votre@gmail.com>
PAYMENT_MODE	Mode paiement	✅	demo, sandbox, live
COMMISSION_STANDARD	Commission 1-4⭐	✅	10
COMMISSION_PREMIUM	Commission 5⭐	✅	15
CINETPAY_API_KEY	Clé API CinetPay	❌	(pour mode sandbox/live)
CINETPAY_SITE_ID	Site ID CinetPay	❌	(pour mode sandbox/live)
CINETPAY_SECRET_KEY	Clé secrète CinetPay	❌	(pour mode sandbox/live)
Frontend (.env.local)
Variable	Description	Requis	Exemple
NEXT_PUBLIC_API_URL	URL de l'API backend	✅	http://localhost:5000/api

🧪 Tests
Comptes de test
Rôle	Email	Mot de passe
Admin	admin@hotelbenin.bj	Admin@2025!
Owner	Créé par l'admin	Envoyé par email
Client	S'inscrit via /auth/register	Choisi à l'inscription


Workflow de test complet

    Admin : Se connecte → Crée un hôtel + owner → Vérifie l'hôtel
    Owner : Se connecte → Ajoute des chambres → Attend des réservations
    Client : S'inscrit → Cherche un hôtel → Réserve → Paye → Reçoit le reçu
    Owner : Confirme la réservation → Le client est notifié
    Après le séjour : Owner marque "terminée" → Client laisse un avis
    Admin : Effectue le reversement à l'owner → Relevé PDF envoyé

👨‍💻 Contributeurs

    Ezechiel DJOKO - Développeur Full Stack - GitHub

📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

🙏 Remerciements

    Next.js - Framework React
    Tailwind CSS - Framework CSS utilitaire
    Chart.js - Bibliothèque de graphiques
    Socket.IO - Communication temps réel
    PDFKit - Génération de PDF
    CinetPay - Paiement en Afrique de l'Ouest

<div align="center">

🏨 HotelBenin — La 1ère plateforme d'hébergement au Bénin 🇧🇯

Fait avec ❤️ au Bénin
</div> ```



📤 Aussi, crée .env.example dans le backend

Crée ~/HotelApp/backend/.env.example

# ============================================
# CONFIGURATION HOTELBENIN
# Copiez ce fichier en .env et remplissez avec vos vraies clés
# ============================================

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

MONGODB_URI=mongodb://localhost:27017/hotelbenin

JWT_SECRET=CHANGEZ_MOI_AVEC_UNE_CLE_ALEATOIRE_LONGUE
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
EMAIL_FROM=HotelBenin <votre_email@gmail.com>

PAYMENT_MODE=demo
COMMISSION_STANDARD=10
COMMISSION_PREMIUM=15

CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
CINETPAY_ENV=sandbox


📤 Aussi, crée .gitignore à la racine

Crée ~/HotelApp/.gitignore

# Dependencies
node_modules/

# Environment files
.env
.env.local
.env.production

# Build
.next/
out/
build/

# Uploads & generated files
backend/uploads/
backend/receipts/
backend/releves/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# PWA generated
frontend/public/sw.js
frontend/public/workbox-*.js
frontend/public/sw.js.map
frontend/public/workbox-*.js.map

# Docker
mongodb_data/

