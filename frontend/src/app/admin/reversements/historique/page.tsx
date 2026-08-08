"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { reversementService, Reversement } from "@/services/reversement.service";
import {
  ArrowLeft,
  Wallet,
  Download,
  CheckCircle2,
  Calendar,
  Hotel as HotelIcon,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import StatCard from "@/components/shared/ui/StatCard";

export default function AdminReversementsHistoriquePage() {
  const [reversements, setReversements] = useState<Reversement[]>([]);
  const [stats, setStats] = useState({ totalReversements: 0, montantTotalVerse: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await reversementService.getAllReversements();
      setReversements(res.data?.reversements || []);
      setStats(res.data?.stats || { totalReversements: 0, montantTotalVerse: 0 });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownload = async (r: Reversement) => {
    try {
      toast.loading("Téléchargement...", { id: "dl" });
      await reversementService.telechargerReleve(r._id, r.numeroReversement);
      toast.success("Téléchargé !", { id: "dl" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur", { id: "dl" });
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="space-y-6">
      <Link href="/admin/reversements" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      <PageHeader title="Historique des reversements" description="Tous les paiements effectués aux hôtels" />

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total reversements" value={stats.totalReversements} icon={<Wallet className="w-5 h-5" />} color="blue" />
        <StatCard label="Montant total versé" value={`${stats.montantTotalVerse.toLocaleString("fr-FR")} XOF`} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
      </div>

      {reversements.length === 0 ? (
        <EmptyState icon={<Wallet className="w-8 h-8" />} title="Aucun reversement" description="Les reversements effectués apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {reversements.map((r) => {
            const hotel = typeof r.hotel === "string" ? null : r.hotel;
            const proprio = typeof r.proprietaire === "string" ? null : r.proprietaire;
            return (
              <Card key={r._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>Effectué</Badge>
                      <span className="text-xs font-mono text-slate-500">{r.numeroReversement}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      {hotel && (
                        <div className="flex items-center gap-2"><HotelIcon className="w-4 h-4 text-slate-400" /><span className="font-medium">{hotel.nom}</span></div>
                      )}
                      {proprio && (
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" /><span>{proprio.prenom} {proprio.nom}</span></div>
                      )}
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span>{new Date(r.dateReversement).toLocaleDateString("fr-FR")}</span></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {r.nombreTransactions} transaction{r.nombreTransactions > 1 ? "s" : ""} • {r.methode.replace("_", " ").toUpperCase()} • Réf: {r.referenceExterne}
                    </p>
                  </div>
                  <div className="lg:border-l lg:pl-6 lg:text-right">
                    <p className="text-2xl font-bold text-green-600 mb-2">{r.montantTotal.toLocaleString("fr-FR")} XOF</p>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(r)} icon={<Download className="w-4 h-4" />}>
                      Relevé PDF
                    </Button>
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