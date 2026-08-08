import api from "@/lib/axios";
import { ApiResponse, Notification } from "@/types";

interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  nonLues: number;
  page: number;
}

export const notificationService = {
  // Récupérer mes notifications
  getMesNotifications: async (page = 1, limit = 20) => {
    const res = await api.get<ApiResponse<NotificationsResponse>>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return res.data;
  },

  // Marquer une notif comme lue
  marquerLue: async (id: string) => {
    const res = await api.put<ApiResponse<{ notification: Notification }>>(
      `/notifications/${id}/read`
    );
    return res.data;
  },

  // Marquer toutes comme lues
  marquerToutesLues: async () => {
    const res = await api.put<ApiResponse<null>>("/notifications/all-read");
    return res.data;
  },

  // Supprimer une notif
  supprimer: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
    return res.data;
  },

  // Supprimer toutes les notifs lues
  supprimerLues: async () => {
    const res = await api.delete<ApiResponse<null>>("/notifications/read");
    return res.data;
  },
};