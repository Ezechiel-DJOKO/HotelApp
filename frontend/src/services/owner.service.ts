import api from "@/lib/axios";
import { ApiResponse, Chambre, Hotel, Reservation, ReservationStatut } from "@/types";

// ============================================
// TYPES STATS
// ============================================
export interface OwnerStats {
  totalChambres: number;
  chambresDisponibles: number;
  totalReservations: number;
  reservationsEnAttente: number;
  reservationsConfirmees: number;
  revenus: number;
  tauxOccupation: number;
}

// ============================================
// SERVICE
// ============================================
export const ownerService = {
  // ============ HÔTELS ============
  // Récupérer mes hôtels (le owner peut en avoir plusieurs mais souvent 1)
  getMesHotels: async () => {
    const res = await api.get<ApiResponse<{ hotels: Hotel[] }>>(
      "/hotels/mes-hotels"
    );
    return res.data;
  },

  updateHotel: async (id: string, formData: FormData) => {
    const res = await api.put<ApiResponse<{ hotel: Hotel }>>(
      `/hotels/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  // ============ CHAMBRES ============
  getChambres: async (hotelId: string) => {
    const res = await api.get<ApiResponse<{ chambres: Chambre[] }>>(
      `/hotels/${hotelId}/chambres`
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

  updateChambre: async (hotelId: string, chambreId: string, formData: FormData) => {
    const res = await api.put<ApiResponse<{ chambre: Chambre }>>(
      `/hotels/${hotelId}/chambres/${chambreId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  deleteChambre: async (hotelId: string, chambreId: string) => {
    const res = await api.delete<ApiResponse<null>>(
      `/hotels/${hotelId}/chambres/${chambreId}`
    );
    return res.data;
  },

  // ============ RÉSERVATIONS ============
  getReservationsHotel: async (hotelId: string) => {
    const res = await api.get<ApiResponse<{ reservations: Reservation[] }>>(
      `/reservations/hotel/${hotelId}`
    );
    return res.data;
  },

  updateStatutReservation: async (id: string, statut: ReservationStatut) => {
    const res = await api.put<ApiResponse<{ reservation: Reservation }>>(
      `/reservations/${id}/statut`,
      { statut }
    );
    return res.data;
  },
};