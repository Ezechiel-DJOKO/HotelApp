// ============ USER ============
export type UserRole = "user" | "owner" | "admin";

export interface User {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  nomComplet?: string;
  createdAt?: string;    // ✅ AJOUT
  updatedAt?: string;    // ✅ AJOUT
}

// ============ HOTEL ============
export type HotelType =
  | "hotel"
  | "auberge"
  | "residence"
  | "guesthouse"
  | "camping"
  | "appartement";

export interface Hotel {
  _id: string;
  nom: string;
  slug: string;
  description: string;
  type: HotelType;
  etoiles: number;
  adresse: string;
  ville: string;
  telephone?: string;
  email?: string;
  images: string[];
  equipements: string[];
  fourchettePrix: {
    min: number;
    max: number;
    devise: string;
  };
  note: number;
  nombreAvis: number;
  estVerifie: boolean;
  estActif: boolean;
}

// ============ CHAMBRE ============
export type ChambreType =
  | "simple"
  | "double"
  | "twin"
  | "triple"
  | "suite"
  | "familiale"
  | "vip"
  | "presidentielle";

export interface Chambre {
  _id: string;
  nom: string;
  type: ChambreType;
  description?: string;
  prixParNuit: number;
  devise: string;
  maxPersonnes: number;
  superficie?: number;
  typeLit?: string;
  images: string[];
  equipements: string[];
  quantiteTotale: number;
  quantiteDisponible: number;
  estDisponible: boolean;
}

// ============ RESERVATION ============
export type ReservationStatut =
  | "en_attente"
  | "payee"
  | "confirmee"
  | "annulee"
  | "terminee";

export interface Reservation {
  _id: string;
  chambreId: string;
  dateArrivee: string;
  dateDepart: string;
  voyageurs: {
    adultes: number;
    enfants: number;
  };
  prixTotal: number;
  statut: ReservationStatut;
  demandesSpeciales?: string;
  contact: {
    nom: string;
    email: string;
    telephone: string;
  };
}

// ============ AVIS ============
export interface Avis {
  _id: string;
  note: number;
  titre: string;
  commentaire: string;
  estVerifie: boolean;
  createdAt: string;
  utilisateur?: {
    nom: string;
    prenom: string;
    avatar?: string;
  };
}

// ============ API RESPONSE ============
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


// ============ NOTIFICATIONS ============
export type NotificationType =
  | "nouvelle_reservation"
  | "reservation_confirmee"
  | "reservation_annulee"
  | "reservation_terminee"
  | "nouvel_avis"
  | "nouvel_hotel"
  | "nouveau_client"
  | "hotel_verifie"
  | "paiement_recu"
  | "systeme";

export type NotificationCouleur =
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "purple"
  | "gray";

export interface Notification {
  _id: string;
  utilisateur: string;
  type: NotificationType;
  titre: string;
  message: string;
  icone: string;
  couleur: NotificationCouleur;
  lien?: string;
  data?: Record<string, unknown>;
  lue: boolean;
  dateLu?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ TRANSACTION ============
export type PaymentMethod =
  | "mtn_momo"
  | "moov_money"
  | "orange_money"
  | "wave"
  | "carte_visa"
  | "carte_mastercard"
  | "demo";

export type TransactionStatut =
  | "en_attente"
  | "reussi"
  | "echoue"
  | "rembourse";

export interface Transaction {
  _id: string;
  reservation: string | Reservation;
  utilisateur: string | User;
  hotel: string | Hotel;
  numeroTransaction: string;
  montantTotal: number;
  tauxCommission: number;
  montantCommission: number;
  montantHotel: number;
  devise: string;
  methode: PaymentMethod;
  telephonePayeur?: string;
  statut: TransactionStatut;
  referenceExterne?: string;
  numeroReçu?: string;
  receiptPdfPath?: string;
  qrCodeData?: string;
  reverse: boolean;
  dateReversement?: string;
  erreur?: string;
  datePaiement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodOption {
  id: PaymentMethod;
  nom: string;
  icon: string;
  couleur: string;
}