import api from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface DemandeProprietaire {
  _id: string;
  utilisateur:
    | string
    | {
        _id: string;
        nom: string;
        prenom: string;
        email: string;
        phone?: string;
        avatar?: string;
        createdAt?: string;
      };
  nomHotel: string;
  typeHotel: string;
  ville: string;
  adresse: string;
  description: string;
  telephoneHotel: string;
  emailHotel?: string;
  nombreChambres: number;
  documents: {
    pieceIdentite: string;
    rccm?: string;
    autres?: { nom: string; url: string }[];
  };
  motivation: string;
  experience?: string;
  statut: "en_attente" | "approuvee" | "refusee";
  traitePar?: {
    _id: string;
    nom: string;
    prenom: string;
  } | string;
  dateTraitement?: string;
  motifRefus?: string;
  notesAdmin?: string;
  createdAt: string;
  updatedAt: string;
}

export const demandeProprietaireService = {
  // Client : faire une demande
  faireDemande: async (formData: FormData) => {
    const res = await api.post<ApiResponse<{ demande: DemandeProprietaire }>>(
      "/demandes-proprietaire",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  // Client : mes demandes
  getMesDemandes: async () => {
    const res = await api.get<ApiResponse<{ demandes: DemandeProprietaire[] }>>(
      "/demandes-proprietaire/mes-demandes"
    );
    return res.data;
  },

  // Admin : toutes les demandes
  getAllDemandes: async (statut?: string) => {
    const query = statut ? `?statut=${statut}` : "";
    const res = await api.get<
      ApiResponse<{
        demandes: DemandeProprietaire[];
        stats: {
          total: number;
          en_attente: number;
          approuvees: number;
          refusees: number;
        };
      }>
    >(`/demandes-proprietaire${query}`);
    return res.data;
  },

  // Admin : voir une demande
  getDemande: async (id: string) => {
    const res = await api.get<ApiResponse<{ demande: DemandeProprietaire }>>(
      `/demandes-proprietaire/${id}`
    );
    return res.data;
  },

  // Admin : approuver
  approuver: async (id: string, notesAdmin?: string) => {
    const res = await api.put<ApiResponse<{ demande: DemandeProprietaire }>>(
      `/demandes-proprietaire/${id}/approuver`,
      { notesAdmin }
    );
    return res.data;
  },

  // Admin : refuser
  refuser: async (id: string, motifRefus: string, notesAdmin?: string) => {
    const res = await api.put<ApiResponse<{ demande: DemandeProprietaire }>>(
      `/demandes-proprietaire/${id}/refuser`,
      { motifRefus, notesAdmin }
    );
    return res.data;
  },
};