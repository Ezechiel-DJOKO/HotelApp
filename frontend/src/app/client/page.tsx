"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { reservationService } from "@/services/reservation.service";
import { Reservation, ReservationStatut } from "@/types";
import {
  Calendar,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  Users,
  Eye,
  Compass,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Badge from "@/components/shared/ui/Badge";

type FilterType = ReservationStatut | "all";

const statutConfig: Record<
  ReservationStatut,
  {
    label: string;
    variant: "default" | "primary" | "success" | "warning" | "danger" | "purple";
    icon: React.ReactNode;
  }
> = {
  en_attente: {
    label: "En attente",
    variant: "warning",
    icon: <Clock className="w-3 h-3" />,
  },
  payee: {
    label: "Payée",
    variant: "primary",
    icon: <CreditCard className="w-3 h-3" />,
  },
  confirmee: {
    label: "Confirmée",
    variant: "success",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  annulee: {
    label: "Annulée",
    variant: "danger",
    icon: <XCircle className="w-3 h-3" />,
  },
  terminee: {
    label: "Terminée",
    variant: "default",
    icon: <CheckCheck className="w-3 h-3" />,
  },
};

interface ReservationWithDetails extends Reservation {
  chambre?: {
    _id: string;
    nom: string;
    hotel?: {
      _id: string;
      nom: string;
      ville: string;
      slug?: string;
      images?: string[];
    };
  };
}

export default function ClientDashboardPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  const load = useCallback(async () => {
    try {
      const res = await reservationService.getMesReservations();
      setReservations(
        (res.data?.reservations as ReservationWithDetails[]) || []
      );
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur de chargement"
      );
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered =
    filter === "all"
      ? reservations
      : reservations.filter((r) => r.statut === filter);

  const stats = {
    total: reservations.length,
    en_attente: reservations.filter((r) => r.statut === "en_attente").length,
    payee: reservations.filter((r) => r.statut === "payee").length,
    confirmee: reservations.filter((r) => r.statut === "confirmee").length,
    terminee: reservations.filter((r) => r.statut === "terminee").length,
    annulee: reservations.filter((r) => r.statut === "annulee").length,
  };

  const filters = [
    { key: "all", label: "Toutes", count: stats.total },
    { key: "en_attente", label: "En attente", count: stats.en_attente },
    { key: "payee", label: "Payées", count: stats.payee },
    { key: "confirmee", label: "Confirmées", count: stats.confirmee },
    { key: "terminee", label: "Terminées", count: stats.terminee },
    { key: "annulee", label: "Annulées", count: stats.annulee },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Réservations"
        description="Gérez et suivez tous vos séjours"
        action={
          <Link href="/hotels">
            <Button
              icon={<Search className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Trouver un hôtel
            </Button>
          </Link>
        }
      />

      {/* Bannière si nouveau client */}
      {stats.total === 0 && (
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                Bienvenue sur HotelBenin ! 👋
              </h2>
              <p className="text-sm text-white/90">
                Explorez nos hôtels et réservez votre prochain séjour au Bénin
              </p>
            </div>
            <Link href="/hotels">
              <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-semibold transition">
                Commencer
              </button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="En attente"
          value={stats.en_attente}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="Confirmées"
          value={stats.confirmee}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Terminées"
          value={stats.terminee}
          icon={<CheckCheck className="w-5 h-5" />}
          color="gray"
        />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filter === f.key
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === f.key
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <Loader label="Chargement de vos réservations..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-8 h-8" />}
          title="Aucune réservation"
          description="Vous n'avez pas encore de réservation dans cette catégorie. Explorez nos hôtels pour trouver votre prochain séjour !"
          action={
            <Link href="/hotels">
              <Button
                icon={<Search className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                Découvrir les hôtels
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((resa) => {
            const config = statutConfig[resa.statut];
            const nuits = Math.ceil(
              (new Date(resa.dateDepart).getTime() -
                new Date(resa.dateArrivee).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return (
              <Card key={resa._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Image de l'hôtel */}
                  {resa.chambre?.hotel?.images?.[0] && (
                    <div className="w-full lg:w-40 h-32 lg:h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resa.chambre.hotel.images[0]}
                        alt={resa.chambre.hotel.nom}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={config.variant} icon={config.icon}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        #{resa._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {resa.chambre?.hotel && (
                      <h3 className="font-bold text-slate-900 mb-1 truncate">
                        {resa.chambre.hotel.nom}
                      </h3>
                    )}
                    {resa.chambre && (
                      <p className="text-sm text-slate-600 mb-3">
                        {resa.chambre.nom} • 📍{" "}
                        {resa.chambre.hotel?.ville || ""}
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-slate-500">Arrivée</p>
                          <p className="font-medium text-xs">
                            {new Date(resa.dateArrivee).toLocaleDateString(
                              "fr-FR",
                              { day: "2-digit", month: "short", year: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="text-xs text-slate-500">Départ</p>
                          <p className="font-medium text-xs">
                            {new Date(resa.dateDepart).toLocaleDateString(
                              "fr-FR",
                              { day: "2-digit", month: "short", year: "2-digit" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Users className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs text-slate-500">
                            {nuits} nuit{nuits > 1 ? "s" : ""}
                          </p>
                          <p className="font-medium text-xs">
                            {resa.voyageurs.adultes} adulte
                            {resa.voyageurs.adultes > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prix + actions */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-3 lg:border-l lg:pl-6 lg:border-slate-200">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-xl font-bold text-blue-600">
                        {resa.prixTotal.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-xs text-slate-500">XOF</p>
                    </div>
                    <Link href={`/client/reservations/${resa._id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Eye className="w-3 h-3" />}
                      >
                        Détails
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}