"use client";

import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { notificationService } from "@/services/notification.service";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { Notification } from "@/types";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export function useNotifications() {
  const { isAuthenticated, user } = useAuthStore();
  const {
    notifications,
    nonLues,
    setNotifications,
    ajouterNotification,
    marquerLue: marquerLueLocal,
    marquerToutesLues: marquerToutesLuesLocal,
    supprimer: supprimerLocal,
  } = useNotificationStore();

  // Charger les notifications initiales
  const load = useCallback(async () => {
    try {
      const res = await notificationService.getMesNotifications(1, 20);
      setNotifications(res.data.notifications, res.data.nonLues);
    } catch (error) {
      console.error("Erreur chargement notifs:", error);
    }
  }, [setNotifications]);

  // Connexion Socket.IO + chargement initial
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = Cookies.get("token");
    if (!token) return;

    // Connecter Socket.IO
    const socket = connectSocket(token);

    // Charger les notifs initiales
    load();

    // Écouter les nouvelles notifs
    const handleNewNotification = (notification: Notification) => {
      console.log("🔔 Nouvelle notif reçue:", notification);
      ajouterNotification(notification);

      // Toast temps réel
      const borderColor =
        notification.couleur === "green"
          ? "#10b981"
          : notification.couleur === "red"
          ? "#ef4444"
          : notification.couleur === "yellow"
          ? "#eab308"
          : notification.couleur === "purple"
          ? "#a855f7"
          : "#3b82f6";

      toast(
        (t) => (
          <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={() => {
              toast.dismiss(t.id);
              if (notification.lien) {
                window.location.href = notification.lien;
              }
            }}
          >
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-900">
                {notification.titre}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {notification.message}
              </p>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-right",
          style: {
            padding: "12px",
            minWidth: "300px",
            borderLeft: `4px solid ${borderColor}`,
          },
        }
      );
    };

    socket.on("nouvelle_notification", handleNewNotification);

    return () => {
      socket.off("nouvelle_notification", handleNewNotification);
    };
  }, [isAuthenticated, user, load, ajouterNotification]);

  // Déconnexion Socket.IO à la déconnexion
  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  // Actions
  const marquerLue = async (id: string) => {
    marquerLueLocal(id);
    try {
      await notificationService.marquerLue(id);
    } catch (error) {
      console.error("Erreur marquer lue:", error);
    }
  };

  const marquerToutesLues = async () => {
    marquerToutesLuesLocal();
    try {
      await notificationService.marquerToutesLues();
      toast.success("Toutes les notifications marquées lues");
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const supprimer = async (id: string) => {
    supprimerLocal(id);
    try {
      await notificationService.supprimer(id);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  return {
    notifications,
    nonLues,
    marquerLue,
    marquerToutesLues,
    supprimer,
    reload: load,
  };
}