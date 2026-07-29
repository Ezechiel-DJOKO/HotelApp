import api from "@/lib/axios";
import { ApiResponse, Hotel, User } from "@/types";

export interface UpdateProfilData {
  nom?: string;
  prenom?: string;
  phone?: string;
}

export const userService = {
  getProfil: async () => {
    const res = await api.get<ApiResponse<{ utilisateur: User }>>(
      "/users/profil"
    );
    return res.data;
  },

  updateProfil: async (data: UpdateProfilData) => {
    const res = await api.put<ApiResponse<{ utilisateur: User }>>(
      "/users/profil",
      data
    );
    return res.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.post<ApiResponse<{ utilisateur: User }>>(
      "/users/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  devenirProprietaire: async () => {
    const res = await api.post<ApiResponse<{ utilisateur: User }>>(
      "/users/devenir-proprietaire"
    );
    return res.data;
  },

  getMesHotels: async () => {
    const res = await api.get<ApiResponse<{ hotels: Hotel[] }>>(
      "/users/mes-hotels"
    );
    return res.data;
  },

  supprimerCompte: async () => {
    const res = await api.delete<ApiResponse<null>>("/users/supprimer-compte");
    return res.data;
  },
};