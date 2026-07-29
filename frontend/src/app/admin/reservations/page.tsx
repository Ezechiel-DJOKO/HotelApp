"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Reservation, ReservationStatut } from "@/types";
import {
  ClipboardList,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  Calendar,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";

interface ReservationWithDetails extends Reservation {
  utilisateur?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  chambre?: {
    _id: string;
    nom: string;
    hotel?: {
      _id: string;
      nom: string;
      ville: string;
    };
  };
}

const statutConfig: Record<
  ReservationStatut,
  {
    label: string;
    variant: "warning" | "success" | "danger" | "default";
    icon: React.ReactNode;
  }
> = {
  en_attente: {
    label: "En attente",
    variant: "warning",
    icon: <Clock className="w-3 h-3" />,
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

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ReservationStatut | "all">("all");

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllReservations();
      setReservations(
        (res.data?.reservations as ReservationWithDetails[]) || []
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = reservations.filter((r) => {
    const matchSearch =
      !search ||
      r.utilisateur?.nom.toLowerCase().includes(search.toLowerCase()) ||
      r.utilisateur?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      r.chambre?.hotel?.nom.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.statut === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: reservations.length,
    en_attente: reservations.filter((r) => r.statut === "en_attente").length,
    confirmee: reservations.filter((r) => r.statut === "confirmee").length,
    terminee: reservations.filter((r) => r.statut === "terminee").length,
    annulee: reservations.filter((r) => r.statut === "annulee").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Toutes les réservations"
        description={`${reservations.length} réservations au total`}
      />

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par client ou hôtel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: `Toutes (${stats.total})` },
              { key: "en_attente", label: `En attente (${stats.en_attente})` },
              { key: "confirmee", label: `Confirmées (${stats.confirmee})` },
              { key: "terminee", label: `Terminées (${stats.terminee})` },
              { key: "annulee", label: `Annulées (${stats.annulee})` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() =>
                  setFilter(f.key as ReservationStatut | "all")
                }
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

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="w-8 h-8" />}
          title="Aucune réservation"
          description="Les réservations apparaîtront ici."
        />
      ) : (
        <div className="space-y-3">
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={config.variant} icon={config.icon}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        #{resa._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {resa.utilisateur && (
                        <div>
                          <p className="text-xs text-slate-500">Client</p>
                          <p className="font-medium text-slate-900 truncate">
                            {resa.utilisateur.prenom} {resa.utilisateur.nom}
                          </p>
                        </div>
                      )}
                      {resa.chambre?.hotel && (
                        <div>
                          <p className="text-xs text-slate-500">Hôtel</p>
                          <p className="font-medium text-slate-900 truncate">
                            {resa.chambre.hotel.nom}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Dates
                        </p>
                        <p className="font-medium text-slate-900">
                          {new Date(resa.dateArrivee).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "short" }
                          )}
                          {" → "}
                          {new Date(resa.dateDepart).toLocaleDateString(
                            "fr-FR",
                            { day: "2-digit", month: "short" }
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {nuits} nuit{nuits > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Voyageurs
                        </p>
                        <p className="font-medium text-slate-900">
                          {resa.voyageurs.adultes} adulte
                          {resa.voyageurs.adultes > 1 ? "s" : ""}
                          {resa.voyageurs.enfants > 0 &&
                            `, ${resa.voyageurs.enfants} enfant${
                              resa.voyageurs.enfants > 1 ? "s" : ""
                            }`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:border-l lg:pl-6 lg:border-slate-200">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-xl font-bold text-slate-900">
                        {resa.prixTotal.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-xs text-slate-500">XOF</p>
                    </div>
                    <Link href={`/admin/reservations/${resa._id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
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