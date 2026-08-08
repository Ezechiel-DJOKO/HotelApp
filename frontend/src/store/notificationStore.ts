import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationState {
  notifications: Notification[];
  nonLues: number;
  loading: boolean;
  setNotifications: (notifications: Notification[], nonLues: number) => void;
  ajouterNotification: (notification: Notification) => void;
  marquerLue: (id: string) => void;
  marquerToutesLues: () => void;
  supprimer: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  nonLues: 0,
  loading: false,

  setNotifications: (notifications, nonLues) =>
    set({ notifications, nonLues }),

  ajouterNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      nonLues: state.nonLues + 1,
    })),

  marquerLue: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, lue: true } : n
      ),
      nonLues: Math.max(0, state.nonLues - 1),
    })),

  marquerToutesLues: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, lue: true })),
      nonLues: 0,
    })),

  supprimer: (id) =>
    set((state) => {
      const notif = state.notifications.find((n) => n._id === id);
      return {
        notifications: state.notifications.filter((n) => n._id !== id),
        nonLues: notif && !notif.lue ? Math.max(0, state.nonLues - 1) : state.nonLues,
      };
    }),

  setLoading: (loading) => set({ loading }),
}));