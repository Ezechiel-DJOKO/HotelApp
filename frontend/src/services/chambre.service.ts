import api from "@/lib/axios";
import { ApiResponse, Chambre } from "@/types";

export const chambreService = {
  getChambres: async (hotelId: string) => {
    const res = await api.get<ApiResponse<{ chambres: Chambre[] }>>(
      `/hotels/${hotelId}/chambres`
    );
    return res.data;
  },

  checkDisponibilite: async (
    hotelId: string,
    dateArrivee: string,
    dateDepart: string
  ) => {
    const res = await api.get<ApiResponse<{ chambres: Chambre[] }>>(
      `/hotels/${hotelId}/chambres/disponibilite`,
      { params: { dateArrivee, dateDepart } }
    );
    return res.data;
  },

  createChambre: async (hotelId: string, formData: FormData) => {
    const res = await api.post<ApiResponse<{ chambre: Chambre }>>(
      `/hotels/${hotelId}/chambres`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  updateChambre: async (
    hotelId: string,
    id: string,
    formData: FormData
  ) => {
    const res = await api.put<ApiResponse<{ chambre: Chambre }>>(
      `/hotels/${hotelId}/chambres/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  deleteChambre: async (hotelId: string, id: string) => {
    const res = await api.delete<ApiResponse<null>>(
      `/hotels/${hotelId}/chambres/${id}`
    );
    return res.data;
  },
};