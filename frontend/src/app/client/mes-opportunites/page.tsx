"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  opportuniteService,
  Opportunite,
} from "@/services/opportunite.service";
import { Hotel } from "@/types";
import {
  Hotel as HotelIcon,
  Handshake,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  PlusCircle,
  Calendar,
  MapPin,
  AlertCircle,
  TrendingUp,
  Eye,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

const typeConfig = {
  proprietaire: {
    label: "Devenir Propriétaire",
    icon: <HotelIcon className="w-5 h-5" />,
    color: "purple",
    gradient: "from-purple-500 to-indigo-600",
  },
  partenaire: {
    label: "Devenir Partenaire",
    icon: <Handshake className="w-5 h-5" />,
    color: "blue",
    gradient: "from-blue-500 to-cyan-600",
  },
  construction: {
    label: "Construire un Hôtel",
    icon: <Building2 className="w-5 h-5" />,
    color: "orange",
    gradient: "from-amber-500 to-orange-600",
  },
};

const statutConfig = {
  en_attente: {
    label: "En attente",
    variant: "warning" as const,
    icon: <Clock className="w-3 h-3" />,
  },
  en_cours: {
    label: "En cours d'examen",
    variant: "primary" as const,
    icon: <Eye className="w-3 h-3" />,
  },
  approuvee: {
    label: "Approuvée",
    variant: "success" as const,
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  refusee: {
    label: "Refusée",
    variant: "danger" as const,
    icon: <XCircle className="w-3 h-3" />,
  },
  terminee: {
    label: "Terminée",
    variant: "default" as const,
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export default function MesOpportunitesPage() {
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await opportuniteService.getMesOpportunites();
      setOpportunites(res.data?.opportunites || []);
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

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/client/investir"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux opportunités
      </Link>

      <PageHeader
        title="Mes Projets d'Investissement"
        description="Suivez l'avancement de vos demandes"
        action={
          <Link href="/client/investir">
            <Button
              icon={<PlusCircle className="w-4 h-4" />}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Nouvelle demande
            </Button>
          </Link>
        }
      />

      {opportunites.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-8 h-8" />}
          title="Aucun projet en cours"
          description="Vous n'avez pas encore soumis de demande d'investissement. Explorez nos opportunités !"
          action={
            <Link href="/client/investir">
              <Button
                icon={<PlusCircle className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Explorer les opportunités
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {opportunites.map((opp) => {
            const typeConf = typeConfig[opp.type];
            const statutConf = statutConfig[opp.statut];
            const hotel = typeof opp.hotelCible === "string" ? null : (opp.hotelCible as Hotel | undefined);

            return (
              <Card key={opp._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icône type */}
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${typeConf.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                  >
                    {typeConf.icon}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={statutConf.variant} icon={statutConf.icon}>
                        {statutConf.label}
                      </Badge>
                      <Badge variant="default">{typeConf.label}</Badge>
                    </div>

                    {/* Hôtel ciblé */}
                    {hotel && (
                      <div className="flex items-center gap-2 mb-2">
                        <HotelIcon className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {hotel.nom}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {hotel.ville}
                        </span>
                      </div>
                    )}

                    {/* Hôtel externe */}
                    {opp.hotelExterne?.nom && (
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {opp.hotelExterne.nom}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          (Non listé)
                        </span>
                      </div>
                    )}

                    {/* Construction */}
                    {opp.type === "construction" && opp.nomProjet && (
                      <p className="font-semibold text-slate-900 dark:text-white mb-2">
                        🏗️ Projet : {opp.nomProjet}
                      </p>
                    )}

                    {/* Infos */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(opp.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      {(opp.budgetEstime ?? 0) > 0 && (
                        <span>
                            💰 Budget : {(opp.budgetEstime ?? 0).toLocaleString("fr-FR")} XOF
                        </span>
                        )}
                      {opp.typeGestion && (
                        <span>📋 {opp.typeGestion}</span>
                      )}
                    </div>

                    {/* Motif refus */}
                    {opp.statut === "refusee" && opp.motifRefus && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-red-900 dark:text-red-300">
                              Motif du refus
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-400">
                              {opp.motifRefus}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes admin */}
                    {opp.notesAdmin && opp.statut !== "refusee" && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg">
                        <p className="text-xs font-semibold text-green-900 dark:text-green-300">
                          Message de l&apos;équipe
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-400">
                          {opp.notesAdmin}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {opp.statut === "approuvee" && opp.type === "proprietaire" && (
                      <div className="mt-3">
                        <Link href="/owner">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500"
                            icon={<HotelIcon className="w-4 h-4" />}
                          >
                            Accéder à mon espace propriétaire
                          </Button>
                        </Link>
                      </div>
                    )}
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