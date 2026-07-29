import api from "@/lib/axios";
import { ApiResponse, Avis } from "@/types";

export interface CreateAvisData {
  note: number;
  titre: string;
  commentaire: string;
}

export const avisService = {
  getAvis: async (hotelId: string, page = 1, limit = 10) => {
    const res = await api.get<
      ApiResponse<{ avis: Avis[]; total: number; totalPages: number }>
    >(`/hotels/${hotelId}/avis`, { params: { page, limit } });
    return res.data;
  },

  create: async (hotelId: string, data: CreateAvisData) => {
    const res = await api.post<ApiResponse<{ avis: Avis }>>(
      `/hotels/${hotelId}/avis`,
      data
    );
    return res.data;
  },
};