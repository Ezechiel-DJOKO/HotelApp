"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BedDouble,
  ClipboardList,
  TrendingUp,
  Sparkles,
  Hotel,
  Clock,
  CheckCircle,
  Eye,
  PlusCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import { ownerService } from "@/services/owner.service";
import { paymentService } from "@/services/payment.service";
import { Hotel as HotelType, Transaction } from "@/types";

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import LineChart from "@/components/shared/charts/LineChart";
import DoughnutChart from "@/components/shared/charts/DoughnutChart";

export default function OwnerDashboardPage() {
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalChambres: 0,
    reservationsEnAttente: 0,
    reservationsConfirmees: 0,
    revenus: 0,
  });

  const load = useCallback(async () => {
    try {
      const res = await ownerService.getMesHotels();
      const hotels = res.data?.hotels || [];

      if (hotels.length > 0) {
        const monHotel = hotels[0];
        setHotel(monHotel);

        try {
          const [chambresRes, reservationsRes, revenusRes] = await Promise.all([
            ownerService.getChambres(monHotel._id),
            ownerService.getReservationsHotel(monHotel._id),
            paymentService.getMesRevenus(),
          ]);

          const chambres = chambresRes.data?.chambres || [];
          const reservations = reservationsRes.data?.reservations || [];
          const trans = revenusRes.data?.transactions || [];

          setTransactions(trans);

          setStats({
            totalChambres: chambres.length,
            reservationsEnAttente: reservations.filter(
              (r) => r.statut === "en_attente"
            ).length,
            reservationsConfirmees: reservations.filter(
              (r) => r.statut === "confirmee"
            ).length,
            revenus: reservations
              .filter((r) => ["confirmee", "terminee"].includes(r.statut))
              .reduce((sum, r) => sum + (r.prixTotal || 0), 0),
          });
        } catch (statsError) {
          console.error("Erreur stats:", statsError);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage label="Chargement..." />;

  // Si le owner n'a pas encore d'hôtel
  if (!hotel) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bienvenue"
          description="Votre espace propriétaire"
        />
        <EmptyState
          icon={<Hotel className="w-8 h-8" />}
          title="Aucun hôtel assigné"
          description="Votre hôtel sera créé par l'administrateur. Contactez-le si besoin."
        />
      </div>
    );
  }

  // ============================================
  // DONNÉES POUR LES GRAPHIQUES
  // ============================================

  // Revenus par mois (6 derniers mois)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return date;
  });

  const revenusParMois = last6Months.map((date) => {
    return transactions
      .filter((t) => {
        const tDate = new Date(t.createdAt);
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth()
        );
      })
      .reduce((sum, t) => sum + (t.montantHotel || 0), 0);
  });

  const moisLabels = last6Months.map((d) =>
    d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" })
  );

  // Méthodes de paiement
  const methodesLabels: Record<string, string> = {
    mtn_momo: "MTN MoMo",
    moov_money: "Moov Money",
    orange_money: "Orange Money",
    wave: "Wave",
    carte_visa: "Visa",
    carte_mastercard: "Mastercard",
    demo: "Démo",
  };

  const parMethode: Record<string, number> = {};
  transactions.forEach((t) => {
    const label = methodesLabels[t.methode] || t.methode;
    parMethode[label] = (parMethode[label] || 0) + 1;
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title={`Bonjour ! 👋`}
        description={`Gérez votre hôtel "${hotel.nom}" en toute simplicité`}
        action={
          <Link href="/owner/hotel/chambres/create">
            <Button
              icon={<PlusCircle className="w-4 h-4" />}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Ajouter une chambre
            </Button>
          </Link>
        }
      />

      {/* BANNIÈRE HÔTEL */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{hotel.nom}</h2>
            <p className="text-sm text-white/90">
              📍 {hotel.ville} • {hotel.type} • {hotel.etoiles} étoiles
            </p>
          </div>
          <Link href="/owner/hotel">
            <button className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold transition">
              Gérer mon hôtel
            </button>
          </Link>
        </div>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Chambres"
          value={stats.totalChambres}
          icon={<BedDouble className="w-5 h-5" />}
          color="purple"
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
          label="Revenus (XOF)"
          value={stats.revenus.toLocaleString("fr-FR")}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* GRAPHIQUES */}
      {transactions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            📊 Mes statistiques
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution des revenus */}
            <Card>
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 mb-1">
                  📈 Évolution de mes revenus
                </h3>
                <p className="text-sm text-slate-500">
                  Vos gains nets sur les 6 derniers mois
                </p>
              </div>
              <LineChart
                labels={moisLabels}
                datasets={[
                  {
                    label: "Revenus nets (XOF)",
                    data: revenusParMois,
                    color: "#a855f7",
                  },
                ]}
                height={280}
              />
            </Card>

            {/* Méthodes de paiement */}
            <Card>
              <div className="mb-4">
                <h3 className="font-bold text-slate-900 mb-1">
                  💳 Méthodes de paiement
                </h3>
                <p className="text-sm text-slate-500">
                  Comment vos clients paient
                </p>
              </div>
              {Object.keys(parMethode).length > 0 ? (
                <DoughnutChart
                  labels={Object.keys(parMethode)}
                  data={Object.values(parMethode)}
                  colors={[
                    "#a855f7",
                    "#ec4899",
                    "#3b82f6",
                    "#06b6d4",
                    "#10b981",
                  ]}
                  height={280}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400">
                  <p className="text-sm">Pas encore de données</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ACTIONS RAPIDES */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/owner/hotel/chambres/create">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Nouvelle chambre
                  </h3>
                  <p className="text-xs text-slate-600">
                    Ajouter une chambre à votre hôtel
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/owner/reservations">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Réservations
                  </h3>
                  <p className="text-xs text-slate-600">
                    {stats.reservationsEnAttente} en attente
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/owner/revenus">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Mes Revenus
                  </h3>
                  <p className="text-xs text-slate-600">Voir mes gains</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/owner/hotel">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <Hotel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Mon hôtel
                  </h3>
                  <p className="text-xs text-slate-600">
                    Voir et modifier les infos
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* ALERTE si pas de chambres */}
      {stats.totalChambres === 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-full text-orange-600 flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">
                Ajoutez vos premières chambres !
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Votre hôtel n&apos;a encore aucune chambre. Ajoutez-en pour
                commencer à recevoir des réservations.
              </p>
              <Link href="/owner/hotel/chambres/create">
                <Button
                  icon={<PlusCircle className="w-4 h-4" />}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  Ajouter une chambre
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}