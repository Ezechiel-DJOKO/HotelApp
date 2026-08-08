"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  opportuniteService,
  Opportunite,
  OpportuniteType,
  OpportuniteStatut,
} from "@/services/opportunite.service";
import { Hotel } from "@/types";
import {
  Hotel as HotelIcon,
  Handshake,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  DollarSign,
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

const typeConfig: Record<OpportuniteType, { label: string; icon: React.ReactNode; gradient: string; badgeColor: "purple" | "primary" | "warning" }> = {
  proprietaire: { label: "Propriétaire", icon: <HotelIcon className="w-5 h-5" />, gradient: "from-purple-500 to-indigo-600", badgeColor: "purple" },
  partenaire: { label: "Partenaire", icon: <Handshake className="w-5 h-5" />, gradient: "from-blue-500 to-cyan-600", badgeColor: "primary" },
  construction: { label: "Construction", icon: <Building2 className="w-5 h-5" />, gradient: "from-amber-500 to-orange-600", badgeColor: "warning" },
};

const statutConfig: Record<OpportuniteStatut, { label: string; variant: "default" | "primary" | "success" | "warning" | "danger"; icon: React.ReactNode }> = {
  en_attente: { label: "En attente", variant: "warning", icon: <Clock className="w-3 h-3" /> },
  en_cours: { label: "En cours", variant: "primary", icon: <Eye className="w-3 h-3" /> },
  approuvee: { label: "Approuvée", variant: "success", icon: <CheckCircle2 className="w-3 h-3" /> },
  refusee: { label: "Refusée", variant: "danger", icon: <XCircle className="w-3 h-3" /> },
  terminee: { label: "Terminée", variant: "default", icon: <CheckCircle2 className="w-3 h-3" /> },
};

export default function AdminOpportunitesPage() {
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [stats, setStats] = useState({
    total: 0, en_attente: 0, en_cours: 0, approuvees: 0, refusees: 0,
    parType: { proprietaire: 0, partenaire: 0, construction: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<OpportuniteType | "all">("all");
  const [filterStatut, setFilterStatut] = useState<OpportuniteStatut | "all">("all");

  const load = useCallback(async () => {
    try {
      const res = await opportuniteService.getAll();
      setOpportunites(res.data?.opportunites || []);
      if (res.data?.stats) setStats(res.data.stats);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader fullPage />;

  const filtered = opportunites.filter((o) => {
    const user = typeof o.utilisateur === "string" ? null : o.utilisateur;
    const hotel = typeof o.hotelCible === "string" ? null : (o.hotelCible as Hotel | undefined);
    const matchSearch = !search ||
      user?.nom.toLowerCase().includes(search.toLowerCase()) ||
      user?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      hotel?.nom?.toLowerCase().includes(search.toLowerCase()) ||
      (o.nomProjet || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || o.type === filterType;
    const matchStatut = filterStatut === "all" || o.statut === filterStatut;
    return matchSearch && matchType && matchStatut;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Opportunités & Investissements" description="Gérez les demandes de propriétaires, partenaires et constructions" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total" value={stats.total} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
        <StatCard label="En attente" value={stats.en_attente} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <StatCard label="Propriétaires" value={stats.parType.proprietaire} icon={<HotelIcon className="w-5 h-5" />} color="purple" />
        <StatCard label="Partenaires" value={stats.parType.partenaire} icon={<Handshake className="w-5 h-5" />} color="blue" />
        <StatCard label="Constructions" value={stats.parType.construction} icon={<Building2 className="w-5 h-5" />} color="yellow" />
      </div>

      {/* Alerte si demandes en attente */}
      {stats.en_attente > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border-yellow-300 dark:border-yellow-500/30 border-l-4 border-l-yellow-500">
          <div className="flex items-center gap-4">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="font-bold text-yellow-900 dark:text-yellow-300">{stats.en_attente} demande{stats.en_attente > 1 ? "s" : ""} en attente</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-400">Traitez-les rapidement pour ne pas décourager les investisseurs</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Rechercher par nom, hôtel, projet..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "Tous" },
              { key: "proprietaire", label: "🏨 Propriétaires" },
              { key: "partenaire", label: "🤝 Partenaires" },
              { key: "construction", label: "🏗️ Constructions" },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilterType(f.key as OpportuniteType | "all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterType === f.key ? "bg-slate-900 text-white" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "Tous statuts" },
              { key: "en_attente", label: "En attente" },
              { key: "en_cours", label: "En cours" },
              { key: "approuvee", label: "Approuvées" },
              { key: "refusee", label: "Refusées" },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilterStatut(f.key as OpportuniteStatut | "all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${filterStatut === f.key ? "bg-purple-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="Aucune opportunité" description="Les demandes d'investissement apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {filtered.map((opp) => {
            const typeConf = typeConfig[opp.type];
            const statutConf = statutConfig[opp.statut];
            const user = typeof opp.utilisateur === "string" ? null : opp.utilisateur;
            const hotel = typeof opp.hotelCible === "string" ? null : (opp.hotelCible as Hotel | undefined);

            return (
              <Card key={opp._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Avatar + type */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`w-12 h-12 bg-gradient-to-br ${typeConf.gradient} rounded-xl flex items-center justify-center text-white`}>
                      {typeConf.icon}
                    </div>
                    {user && (
                      <div className="lg:hidden">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statutConf.variant} icon={statutConf.icon}>{statutConf.label}</Badge>
                      <Badge variant={typeConf.badgeColor}>{typeConf.label}</Badge>
                      {opp.priorite === "haute" && <Badge variant="danger">Priorité haute</Badge>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {user && (
                        <div className="hidden lg:flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Demandeur</p>
                            <p className="font-medium text-slate-900 dark:text-white truncate">{user.prenom} {user.nom}</p>
                          </div>
                        </div>
                      )}
                      {hotel && (
                        <div className="flex items-center gap-2">
                          <HotelIcon className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Hôtel ciblé</p>
                            <p className="font-medium text-slate-900 dark:text-white truncate">{hotel.nom}</p>
                          </div>
                        </div>
                      )}
                      {opp.nomProjet && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Projet</p>
                            <p className="font-medium text-slate-900 dark:text-white truncate">{opp.nomProjet}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Date</p>
                          <p className="font-medium text-slate-900 dark:text-white text-xs">
                            {new Date(opp.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {(opp.budgetEstime ?? 0) > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        Budget : {(opp.budgetEstime ?? 0).toLocaleString("fr-FR")} XOF
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <Link href={`/admin/opportunites/${opp._id}`}>
                      <Button
                        icon={<Eye className="w-4 h-4" />}
                        className={opp.statut === "en_attente" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                        variant={opp.statut === "en_attente" ? undefined : "outline"}
                      >
                        {opp.statut === "en_attente" ? "Traiter" : "Détails"}
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