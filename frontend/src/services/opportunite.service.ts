import api from "@/lib/axios";
import { ApiResponse, Hotel } from "@/types";

export type OpportuniteType = "proprietaire" | "partenaire" | "construction";
export type OpportuniteStatut = "en_attente" | "en_cours" | "approuvee" | "refusee" | "terminee";

export interface Opportunite {
  _id: string;
  utilisateur: string | {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    phone?: string;
    avatar?: string;
    createdAt?: string;
  };
  type: OpportuniteType;
  hotelCible?: string | Hotel;
  hotelExterne?: {
    nom: string;
    ville: string;
    adresse: string;
    description: string;
    telephone: string;
    email: string;
  };
  typeGestion?: string;
  typePartenariat?: string;
  montantInvestissement?: number;
  dureePartenariat?: string;
  nomProjet?: string;
  villeSouhaitee?: string;
  typeHebergement?: string;
  nombreChambresPrevu?: number;
  terrainAcquis?: boolean;
  budgetEstime?: number;
  devise: string;
  motivation: string;
  experience?: string;
  descriptionProjet?: string;
  documents: {
    pieceIdentite?: string;
    preuveFonds?: string;
    businessPlan?: string;
    rccm?: string;
    preuveProriete?: string;
  };
  contactPrefere: string;
  telephoneContact?: string;
  statut: OpportuniteStatut;
  traitePar?: { _id: string; nom: string; prenom: string } | string;
  dateTraitement?: string;
  motifRefus?: string;
  notesAdmin?: string;
  priorite: string;
  createdAt: string;
}

export const opportuniteService = {
  // Client : créer une demande
  creer: async (formData: FormData) => {
    const res = await api.post<ApiResponse<{ opportunite: Opportunite }>>(
      "/opportunites",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  // Client : mes opportunités
  getMesOpportunites: async () => {
    const res = await api.get<ApiResponse<{ opportunites: Opportunite[] }>>(
      "/opportunites/mes-opportunites"
    );
    return res.data;
  },

  // Admin : toutes les opportunités
  getAll: async (type?: string, statut?: string) => {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (statut) params.append("statut", statut);
    const query = params.toString() ? `?${params.toString()}` : "";

    const res = await api.get<
      ApiResponse<{
        opportunites: Opportunite[];
        stats: {
          total: number;
          en_attente: number;
          en_cours: number;
          approuvees: number;
          refusees: number;
          parType: {
            proprietaire: number;
            partenaire: number;
            construction: number;
          };
        };
      }>
    >(`/opportunites${query}`);
    return res.data;
  },

  // Admin : détail
  getById: async (id: string) => {
    const res = await api.get<ApiResponse<{ opportunite: Opportunite }>>(
      `/opportunites/${id}`
    );
    return res.data;
  },

  // Admin : changer statut
  updateStatut: async (
    id: string,
    statut: OpportuniteStatut,
    notesAdmin?: string,
    motifRefus?: string
  ) => {
    const res = await api.put<ApiResponse<{ opportunite: Opportunite }>>(
      `/opportunites/${id}/statut`,
      { statut, notesAdmin, motifRefus }
    );
    return res.data;
  },
};