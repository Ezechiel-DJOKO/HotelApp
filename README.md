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