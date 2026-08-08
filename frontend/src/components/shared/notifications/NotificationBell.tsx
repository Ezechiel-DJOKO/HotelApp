"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Star,
  Hotel,
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification, NotificationCouleur } from "@/types";

// Mapping des icônes
const iconMap: Record<string, React.ReactNode> = {
  Bell: <Bell className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Hotel: <Hotel className="w-4 h-4" />,
  UserPlus: <UserPlus className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
  XCircle: <XCircle className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
};

const couleurStyles: Record<NotificationCouleur, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
};

const formatTimeAgo = (date: string) => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "à l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR");
};

interface NotificationBellProps {
  color?: "blue" | "purple" | "red";
}

export default function NotificationBell({
  color = "blue",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    nonLues,
    marquerLue,
    marquerToutesLues,
    supprimer,
  } = useNotifications();

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dotColor = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
  }[color];

  const handleClick = (notif: Notification) => {
    if (!notif.lue) marquerLue(notif._id);
    setOpen(false);
    if (notif.lien) {
      window.location.href = notif.lien;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-100 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {nonLues > 0 && (
          <>
            <span
              className={`absolute top-1 right-1 w-2 h-2 ${dotColor} rounded-full`}
            />
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 ${dotColor} text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse`}
            >
              {nonLues > 9 ? "9+" : nonLues}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <p className="text-xs text-slate-500">
                {nonLues > 0
                  ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}`
                  : "Tout est à jour"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {nonLues > 0 && (
                <button
                  onClick={marquerToutesLues}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-600"
                  title="Tout marquer comme lu"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  Aucune notification pour le moment
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`group relative p-3 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer ${
                    !notif.lue ? "bg-blue-50/30" : ""
                  }`}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icône */}
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        couleurStyles[notif.couleur]
                      }`}
                    >
                      {iconMap[notif.icone] || iconMap.Bell}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm ${
                            !notif.lue
                              ? "font-semibold text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          {notif.titre}
                        </p>
                        {!notif.lue && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTimeAgo(notif.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition flex flex-col gap-1">
                      {!notif.lue && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marquerLue(notif._id);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500"
                          title="Marquer comme lu"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          supprimer(notif._id);
                        }}
                        className="p-1 rounded hover:bg-red-100 text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Voir toutes les notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}