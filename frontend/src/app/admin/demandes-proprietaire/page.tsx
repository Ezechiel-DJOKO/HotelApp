"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  demandeProprietaireService,
  DemandeProprietaire,
} from "@/services/demandeProprietaire.service";
import {
  Hotel,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  MapPin,
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
import StatCard from "@/components/shared/ui/StatCard";

export default function AdminDemandesPage() {
  const [demandes, setDemandes] = useState<DemandeProprietaire[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    en_attente: 0,
    approuvees: 0,
    refusees: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "en_attente" | "approuvee" | "refusee"
  >("all");

  const load = useCallback(async () => {
    try {
      const res = await demandeProprietaireService.getAllDemandes();
      setDemandes(res.data?.demandes || []);
      setStats(
        res.data?.stats || {
          total: 0,
          en_attente: 0,
          approuvees: 0,
          refusees: 0,
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage />;

  const filtered = demandes.filter((d) => {
    const utilisateur = typeof d.utilisateur === "string" ? null : d.utilisateur;
    const matchSearch =
      !search ||
      d.nomHotel.toLowerCase().includes(search.toLowerCase()) ||
      d.ville.toLowerCase().includes(search.toLowerCase()) ||
      utilisateur?.nom.toLowerCase().includes(search.toLowerCase()) ||
      utilisateur?.prenom.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || d.statut === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demandes de propriétaires"
        description="Validez les demandes des clients qui veulent devenir propriétaires"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<UserPlus className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="En attente"
          value={stats.en_attente}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="Approuvées"
          value={stats.approuvees}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Refusées"
          value={stats.refusees}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom d'hôtel, ville, client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: `Toutes (${stats.total})` },
              { key: "en_attente", label: `En attente (${stats.en_attente})` },
              { key: "approuvee", label: `Approuvées (${stats.approuvees})` },
              { key: "refusee", label: `Refusées (${stats.refusees})` },
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

      {/* Alerte s'il y a des demandes en attente */}
      {stats.en_attente > 0 && filter === "all" && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-yellow-900">
                {stats.en_attente} demande{stats.en_attente > 1 ? "s" : ""} en
                attente de validation
              </p>
              <p className="text-sm text-yellow-800">
                Traitez-les rapidement pour ne pas décourager les demandeurs
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="w-8 h-8" />}
          title="Aucune demande"
          description={
            filter === "all"
              ? "Aucune demande de propriétaire pour le moment."
              : `Aucune demande dans cette catégorie.`
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((demande) => {
            const utilisateur =
              typeof demande.utilisateur === "string"
                ? null
                : demande.utilisateur;

            return (
              <Card key={demande._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Avatar client */}
                  {utilisateur && (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {utilisateur.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={utilisateur.avatar}
                          alt={utilisateur.nom}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {utilisateur.prenom?.[0]}
                          {utilisateur.nom?.[0]}
                        </div>
                      )}
                      <div className="lg:hidden">
                        <p className="font-semibold text-slate-900">
                          {utilisateur.prenom} {utilisateur.nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {utilisateur.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {demande.statut === "en_attente" && (
                        <Badge
                          variant="warning"
                          icon={<Clock className="w-3 h-3" />}
                        >
                          En attente
                        </Badge>
                      )}
                      {demande.statut === "approuvee" && (
                        <Badge
                          variant="success"
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Approuvée
                        </Badge>
                      )}
                      {demande.statut === "refusee" && (
                        <Badge
                          variant="danger"
                          icon={<XCircle className="w-3 h-3" />}
                        >
                          Refusée
                        </Badge>
                      )}
                      <Badge variant="default">{demande.typeHotel}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {/* Hôtel */}
                      <div className="flex items-center gap-2">
                        <Hotel className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Hôtel</p>
                          <p className="font-medium text-slate-900 truncate">
                            {demande.nomHotel}
                          </p>
                        </div>
                      </div>

                      {/* Ville */}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Ville</p>
                          <p className="font-medium text-slate-900 truncate">
                            {demande.ville}
                          </p>
                        </div>
                      </div>

                      {/* Client (desktop) */}
                      {utilisateur && (
                        <div className="hidden lg:flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">
                              Demandeur
                            </p>
                            <p className="font-medium text-slate-900 truncate">
                              {utilisateur.prenom} {utilisateur.nom}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Demandée le{" "}
                        {new Date(demande.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="lg:border-l lg:pl-6 flex-shrink-0">
                    <Link href={`/admin/demandes-proprietaire/${demande._id}`}>
                      <Button
                        icon={<Eye className="w-4 h-4" />}
                        className={
                          demande.statut === "en_attente"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500"
                            : ""
                        }
                        variant={
                          demande.statut === "en_attente"
                            ? undefined
                            : "outline"
                        }
                      >
                        {demande.statut === "en_attente"
                          ? "Traiter"
                          : "Voir détails"}
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