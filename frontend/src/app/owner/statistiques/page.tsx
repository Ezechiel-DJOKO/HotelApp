"use client";

import { useEffect, useState, useCallback } from "react";
import { ownerService } from "@/services/owner.service";
import {
  TrendingUp,
  Users,
  BedDouble,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  CheckCheck,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Loader from "@/components/shared/ui/Loader";

export default function OwnerStatistiquesPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChambres: 0,
    quantiteTotaleChambres: 0,
    totalReservations: 0,
    reservationsEnAttente: 0,
    reservationsConfirmees: 0,
    reservationsAnnulees: 0,
    reservationsTerminees: 0,
    totalNuits: 0,
    revenus: 0,
    revenusConfirmees: 0,
    revenusTerminees: 0,
    tauxOccupation: 0,
    prixMoyen: 0,
  });

  const load = useCallback(async () => {
    try {
      const hotelsRes = await ownerService.getMesHotels();
      const hotel = hotelsRes.data?.hotels?.[0];
      if (!hotel) return;

      const [chambresRes, resaRes] = await Promise.all([
        ownerService.getChambres(hotel._id),
        ownerService.getReservationsHotel(hotel._id),
      ]);

      const chambres = chambresRes.data?.chambres || [];
      const reservations = resaRes.data?.reservations || [];

      const quantiteTotale = chambres.reduce(
        (sum, c) => sum + (c.quantiteTotale || 1),
        0
      );

      const totalNuits = reservations
        .filter((r) => ["confirmee", "terminee"].includes(r.statut))
        .reduce((sum, r) => {
          const nuits = Math.ceil(
            (new Date(r.dateDepart).getTime() -
              new Date(r.dateArrivee).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return sum + nuits;
        }, 0);

      const revenusConfirmees = reservations
        .filter((r) => r.statut === "confirmee")
        .reduce((sum, r) => sum + (r.prixTotal || 0), 0);

      const revenusTerminees = reservations
        .filter((r) => r.statut === "terminee")
        .reduce((sum, r) => sum + (r.prixTotal || 0), 0);

      const revenus = revenusConfirmees + revenusTerminees;
      const nbConfirmees = reservations.filter((r) =>
        ["confirmee", "terminee"].includes(r.statut)
      ).length;

      setStats({
        totalChambres: chambres.length,
        quantiteTotaleChambres: quantiteTotale,
        totalReservations: reservations.length,
        reservationsEnAttente: reservations.filter(
          (r) => r.statut === "en_attente"
        ).length,
        reservationsConfirmees: reservations.filter(
          (r) => r.statut === "confirmee"
        ).length,
        reservationsAnnulees: reservations.filter(
          (r) => r.statut === "annulee"
        ).length,
        reservationsTerminees: reservations.filter(
          (r) => r.statut === "terminee"
        ).length,
        totalNuits,
        revenus,
        revenusConfirmees,
        revenusTerminees,
        tauxOccupation:
          quantiteTotale > 0
            ? Math.round((totalNuits / (quantiteTotale * 365)) * 100)
            : 0,
        prixMoyen: nbConfirmees > 0 ? Math.round(revenus / nbConfirmees) : 0,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage label="Calcul des statistiques..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques"
        description="Analyse détaillée de votre activité"
      />

      {/* Revenus - Cartes principales */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">💰 Revenus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <p className="text-sm text-white/90 mb-1">Total des revenus</p>
            <p className="text-3xl font-bold">
              {stats.revenus.toLocaleString("fr-FR")}
            </p>
            <p className="text-sm text-white/90 mt-1">XOF</p>
          </Card>
          <StatCard
            label="Revenus confirmés"
            value={`${stats.revenusConfirmees.toLocaleString("fr-FR")} XOF`}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Revenus (terminées)"
            value={`${stats.revenusTerminees.toLocaleString("fr-FR")} XOF`}
            icon={<CheckCheck className="w-5 h-5" />}
            color="gray"
          />
        </div>
      </div>

      {/* Réservations */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          📅 Réservations
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={stats.totalReservations}
            icon={<Calendar className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="En attente"
            value={stats.reservationsEnAttente}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatCard
            label="Confirmées"
            value={stats.reservationsConfirmees}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Annulées"
            value={stats.reservationsAnnulees}
            icon={<XCircle className="w-5 h-5" />}
            color="red"
          />
        </div>
      </div>

      {/* Performance */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">📊 Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Types de chambres"
            value={stats.totalChambres}
            icon={<BedDouble className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Chambres totales"
            value={stats.quantiteTotaleChambres}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Nuits vendues"
            value={stats.totalNuits}
            icon={<Calendar className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Taux occupation"
            value={`${stats.tauxOccupation}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
        </div>
      </div>

      {/* Prix moyen */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full text-purple-600 flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">
              Prix moyen par réservation
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.prixMoyen.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Calculé sur les réservations confirmées et terminées
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}