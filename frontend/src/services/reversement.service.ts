import api from "@/lib/axios";
import { ApiResponse } from "@/types";

export interface HotelAVerser {
  hotel: {
    _id: string;
    nom: string;
    ville: string;
    etoiles: number;
    proprietaire: string;
  };
  transactions: Array<{
    _id: string;
    numeroTransaction: string;
    montantTotal: number;
    montantHotel: number;
    montantCommission: number;
    createdAt: string;
  }>;
  montantTotal: number;
  nombreTransactions: number;
  owner: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    phone?: string;
  } | null;
}

export interface Reversement {
  _id: string;
  numeroReversement: string;
  hotel: { _id: string; nom: string; ville: string } | string;
  proprietaire: { _id: string; nom: string; prenom: string; email: string } | string;
  admin: { _id: string; nom: string; prenom: string } | string;
  transactions: string[];
  montantTotal: number;
  devise: string;
  nombreTransactions: number;
  methode: string;
  destinataire?: {
    nom?: string;
    telephone?: string;
    rib?: string;
    banque?: string;
  };
  referenceExterne: string;
  notes?: string;
  statut: "planifie" | "effectue" | "annule" | "echec";
  relevePdfPath?: string;
  dateReversement: string;
  createdAt: string;
}

export interface EffectuerReversementData {
  hotelId: string;
  methode: string;
  referenceExterne: string;
  destinataire?: {
    nom?: string;
    telephone?: string;
    rib?: string;
    banque?: string;
  };
  notes?: string;
}

export const reversementService = {
  getHotelsAVerser: async () => {
    const res = await api.get<
      ApiResponse<{
        hotels: HotelAVerser[];
        totalGeneral: number;
        nombreHotels: number;
      }>
    >("/reversements/hotels-a-verser");
    return res.data;
  },

  effectuerReversement: async (data: EffectuerReversementData) => {
    const res = await api.post<ApiResponse<{ reversement: Reversement }>>(
      "/reversements/effectuer",
      data
    );
    return res.data;
  },

  getAllReversements: async () => {
    const res = await api.get<
      ApiResponse<{
        reversements: Reversement[];
        stats: { totalReversements: number; montantTotalVerse: number };
      }>
    >("/reversements/all");
    return res.data;
  },

  getMesReversements: async () => {
    const res = await api.get<ApiResponse<{ reversements: Reversement[] }>>(
      "/reversements/mes-reversements"
    );
    return res.data;
  },

  telechargerReleve: async (id: string, numero?: string) => {
    const response = await api.get(`/reversements/receipt/${id}`, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Releve-HotelBenin-${numero || id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};