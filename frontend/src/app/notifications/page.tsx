"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/authStore";
import { Notification, NotificationCouleur } from "@/types";
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Star,
  Hotel,
  UserPlus,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertCircle,
  DollarSign,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";
import StatCard from "@/components/shared/ui/StatCard";

const iconMap: Record<string, React.ReactNode> = {
  Bell: <Bell className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Hotel: <Hotel className="w-5 h-5" />,
  UserPlus: <UserPlus className="w-5 h-5" />,
  CheckCircle: <CheckCircle className="w-5 h-5" />,
  XCircle: <XCircle className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
};

const couleurStyles: Record<NotificationCouleur, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
  purple: "bg-purple-100 text-purple-600",
  gray: "bg-gray-100 text-gray-600",
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffJ = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffJ < 7) return `Il y a ${diffJ}j`;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const {
    notifications,
    nonLues,
    marquerLue,
    marquerToutesLues,
    supprimer,
  } = useNotifications();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Rediriger vers le bon dashboard selon le rôle
  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin";
    if (user.role === "owner") return "/owner";
    return "/client";
  };

  const filtered = notifications.filter((n) => {
    const matchSearch =
      !search ||
      n.titre.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "unread" && !n.lue) ||
      (filter === "read" && n.lue);
    return matchSearch && matchFilter;
  });

  const handleClick = (notif: Notification) => {
    if (!notif.lue) marquerLue(notif._id);
    if (notif.lien) {
      window.location.href = notif.lien;
    }
  };

  return (
  <div className="space-y-6 max-w-4xl">
        {/* Retour */}
        <Link
          href={getDashboardLink()}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au dashboard
        </Link>

        <PageHeader
          title="Notifications"
          description={`Vous avez ${nonLues} notification${
            nonLues > 1 ? "s" : ""
          } non lue${nonLues > 1 ? "s" : ""}`}
          action={
            nonLues > 0 && (
              <Button
                onClick={marquerToutesLues}
                icon={<CheckCheck className="w-4 h-4" />}
              >
                Tout marquer lu
              </Button>
            )
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total"
            value={notifications.length}
            icon={<Bell className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Non lues"
            value={nonLues}
            icon={<AlertCircle className="w-5 h-5" />}
            color="yellow"
          />
          <StatCard
            label="Lues"
            value={notifications.length - nonLues}
            icon={<Check className="w-5 h-5" />}
            color="green"
          />
        </div>

        {/* Filtres */}
        <Card padding="sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Rechercher dans les notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              {[
                { key: "all", label: `Toutes (${notifications.length})` },
                { key: "unread", label: `Non lues (${nonLues})` },
                {
                  key: "read",
                  label: `Lues (${notifications.length - nonLues})`,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key as typeof filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    filter === f.key
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Liste */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-8 h-8" />}
            title={
              filter === "all"
                ? "Aucune notification"
                : filter === "unread"
                ? "Aucune notification non lue"
                : "Aucune notification lue"
            }
            description="Vos notifications apparaîtront ici en temps réel."
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => (
              <Card
                key={notif._id}
                className={`transition cursor-pointer group ${
                  !notif.lue ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
                }`}
                hover
                onClick={() => handleClick(notif)}
              >
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${
                      couleurStyles[notif.couleur]
                    }`}
                  >
                    {iconMap[notif.icone] || iconMap.Bell}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold text-slate-900 ${
                          !notif.lue ? "font-bold" : ""
                        }`}
                      >
                        {notif.titre}
                      </h3>
                      {!notif.lue && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    {!notif.lue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          marquerLue(notif._id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        supprimer(notif._id);
                        toast.success("Notification supprimée");
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    
  );
}