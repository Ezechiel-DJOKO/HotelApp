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