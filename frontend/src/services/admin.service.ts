import api from "@/lib/axios";
import { ApiResponse, Hotel, Reservation, User } from "@/types";

// ============================================
// TYPES
// ============================================
export interface AdminStats {
  totalClients: number;
  totalOwners: number;
  totalHotels: number;
  totalReservations: number;
  hotelsNonVerifies: number;
  totalRevenus: number;
}

export interface CreateHotelWithOwnerData {
  ownerEmail: string;
  ownerNom: string;
  ownerPrenom: string;
  ownerPhone: string;
  nom: string;
  description: string;
  type: string;
  etoiles: number;
  adresse: string;
  ville: string;
  telephone?: string;
  email?: string;
}

// ============================================
// SERVICE
// ============================================
export const adminService = {
  // STATS
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStats>>("/admin/stats");
    return res.data;
  },

  // HOTELS
  getAllHotels: async () => {
    const res = await api.get<ApiResponse<{ hotels: Hotel[] }>>("/admin/hotels");
    return res.data;
  },

  createHotelWithOwner: async (formData: FormData) => {
    const res = await api.post<
      ApiResponse<{
        hotel: Hotel;
        owner: { _id: string; email: string; nom: string; prenom: string };
        tempPassword?: string;
      }>
    >("/admin/hotels/create-with-owner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  verifyHotel: async (id: string) => {
    const res = await api.put<ApiResponse<{ hotel: Hotel }>>(
      `/admin/hotels/${id}/verify`
    );
    return res.data;
  },

  toggleHotelActive: async (id: string) => {
    const res = await api.put<ApiResponse<{ hotel: Hotel }>>(
      `/admin/hotels/${id}/toggle-active`
    );
    return res.data;
  },

  // OWNERS
  getAllOwners: async () => {
    const res = await api.get<ApiResponse<{ owners: User[] }>>(
      "/admin/owners"
    );
    return res.data;
  },

  // CLIENTS
  getAllClients: async () => {
    const res = await api.get<ApiResponse<{ clients: User[] }>>(
      "/admin/clients"
    );
    return res.data;
  },

  // USERS (owners + clients)
  getUserById: async (id: string) => {
    const res = await api.get<ApiResponse<{ user: User }>>(
      `/admin/users/${id}`
    );
    return res.data;
  },

  toggleUserActive: async (id: string) => {
    const res = await api.put<ApiResponse<{ user: User }>>(
      `/admin/users/${id}/toggle-active`
    );
    return res.data;
  },

  deleteUser: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return res.data;
  },

  // RESERVATIONS
  getAllReservations: async () => {
    const res = await api.get<ApiResponse<{ reservations: Reservation[] }>>(
      "/admin/reservations"
    );
    return res.data;
  },
};