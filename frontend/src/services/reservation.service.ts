import api from "@/lib/axios";
import { ApiResponse, Reservation, ReservationStatut } from "@/types";

export interface CreateReservationData {
  chambreId: string;
  dateArrivee: string;
  dateDepart: string;
  voyageurs: {
    adultes: number;
    enfants: number;
  };
  demandesSpeciales?: string;
}

export const reservationService = {
  create: async (data: CreateReservationData) => {
    const res = await api.post<ApiResponse<{ reservation: Reservation }>>(
      "/reservations",
      data
    );
    return res.data;
  },

  getMesReservations: async () => {
    const res = await api.get<ApiResponse<{ reservations: Reservation[] }>>(
      "/reservations/mes-reservations"
    );
    return res.data;
  },

  getReservationsHotel: async (hotelId: string) => {
    const res = await api.get<ApiResponse<{ reservations: Reservation[] }>>(
      `/reservations/hotel/${hotelId}`
    );
    return res.data;
  },

  updateStatut: async (id: string, statut: ReservationStatut) => {
    const res = await api.put<ApiResponse<{ reservation: Reservation }>>(
      `/reservations/${id}/statut`,
      { statut }
    );
    return res.data;
  },
};