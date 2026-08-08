"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  UserCog,
  Hotel,
  ClipboardList,
  ShieldAlert,
  TrendingUp,
  PlusCircle,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminService, AdminStats } from "@/services/admin.service";
import { paymentService } from "@/services/payment.service";
import { Transaction } from "@/types";

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import LineChart from "@/components/shared/charts/LineChart";
import DoughnutChart from "@/components/shared/charts/DoughnutChart";
import BarChart from "@/components/shared/charts/BarChart";

interface TransactionWithHotel extends Omit<Transaction, "hotel"> {
  hotel?: {
    _id: string;
    nom: string;
    ville?: string;
  } | string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithHotel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        adminService.getStats(),
        paymentService.getAllTransactions(),
      ]);

      setStats(statsRes.data);
      setTransactions(
        (transactionsRes.data?.transactions as TransactionWithHotel[]) || []
      );
    } catch (error) {
      console.error("Erreur stats:", error);
      toast.error(
        error instanceof Error ? error.message : "Erreur de chargement"
      );
      setStats({
        totalClients: 0,
        totalOwners: 0,
        totalHotels: 0,
        totalReservations: 0,
        hotelsNonVerifies: 0,
        totalRevenus: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return <Loader fullPage label="Chargement des statistiques..." />;

  // ============================================
  // DONNÉES POUR LES GRAPHIQUES
  // ============================================

  // Graphique 1 : Évolution des commissions sur 30 jours
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  const revenusParJour = last30Days.map((date) => {
    const dayTransactions = transactions.filter((t) => {
      if (t.statut !== "reussi") return false;
      const tDate = new Date(t.createdAt);
      return (
        tDate.getFullYear() === date.getFullYear() &&
        tDate.getMonth() === date.getMonth() &&
        tDate.getDate() === date.getDate()
      );
    });
    return dayTransactions.reduce((sum, t) => sum + t.montantCommission, 0);
  });

  const revenusLabels = last30Days.map((d) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
  );

  // Graphique 2 : Répartition par méthode de paiement
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
  transactions
    .filter((t) => t.statut === "reussi")
    .forEach((t) => {
      const label = methodesLabels[t.methode] || t.methode;
      parMethode[label] = (parMethode[label] || 0) + t.montantTotal;
    });

  // Graphique 3 : Statuts des transactions
  const statutsCount = {
    reussi: transactions.filter((t) => t.statut === "reussi").length,
    echoue: transactions.filter((t) => t.statut === "echoue").length,
    en_attente: transactions.filter((t) => t.statut === "en_attente").length,
  };

  // Graphique 4 : Top 5 hôtels par revenus
  const hotelRevenus: Record<string, number> = {};
  transactions
    .filter((t) => t.statut === "reussi" && t.hotel && typeof t.hotel !== "string")
    .forEach((t) => {
      const hotel = t.hotel as { _id: string; nom: string };
      hotelRevenus[hotel.nom] = (hotelRevenus[hotel.nom] || 0) + t.montantTotal;
    });

  const topHotels = Object.entries(hotelRevenus)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de la plateforme HotelBenin"
        action={
          <Link href="/admin/hotels/create">
            <Button icon={<PlusCircle className="w-4 h-4" />}>
              Créer un hôtel
            </Button>
          </Link>
        }
      />

      {/* STATS PRINCIPALES */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Clients"
          value={stats?.totalClients || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Propriétaires"
          value={stats?.totalOwners || 0}
          icon={<UserCog className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Hôtels"
          value={stats?.totalHotels || 0}
          icon={<Hotel className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Réservations"
          value={stats?.totalReservations || 0}
          icon={<ClipboardList className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="À vérifier"
          value={stats?.hotelsNonVerifies || 0}
          icon={<ShieldAlert className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Revenus (XOF)"
          value={stats?.totalRevenus.toLocaleString("fr-FR") || "0"}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* GRAPHIQUES */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          📊 Analyses & Tendances
        </h2>

        {/* Graphique évolution des revenus */}
        <Card className="mb-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 mb-1">
              📈 Évolution des commissions
            </h3>
            <p className="text-sm text-slate-500">
              Vos revenus (commissions) sur les 30 derniers jours
            </p>
          </div>
          {revenusParJour.some((v) => v > 0) ? (
            <LineChart
              labels={revenusLabels}
              datasets={[
                {
                  label: "Commissions (XOF)",
                  data: revenusParJour,
                  color: "#8b5cf6",
                },
              ]}
              height={280}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Pas encore de données</p>
              </div>
            </div>
          )}
        </Card>

        {/* Grille 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Méthodes de paiement */}
          <Card>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 mb-1">
                💳 Méthodes de paiement
              </h3>
              <p className="text-sm text-slate-500">Répartition des revenus</p>
            </div>
            {Object.keys(parMethode).length > 0 ? (
              <DoughnutChart
                labels={Object.keys(parMethode)}
                data={Object.values(parMethode)}
                height={280}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <p className="text-sm">Pas encore de données</p>
              </div>
            )}
          </Card>

          {/* Statuts */}
          <Card>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 mb-1">
                📊 Statuts des transactions
              </h3>
              <p className="text-sm text-slate-500">Vue d&apos;ensemble</p>
            </div>
            {transactions.length > 0 ? (
              <DoughnutChart
                labels={["Réussies", "Échouées", "En attente"]}
                data={[
                  statutsCount.reussi,
                  statutsCount.echoue,
                  statutsCount.en_attente,
                ]}
                colors={["#10b981", "#ef4444", "#f59e0b"]}
                height={280}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-400">
                <p className="text-sm">Pas encore de transactions</p>
              </div>
            )}
          </Card>
        </div>

        {/* Top 5 hôtels */}
        {topHotels.length > 0 && (
          <Card>
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 mb-1">
                🏆 Top 5 hôtels par revenus
              </h3>
              <p className="text-sm text-slate-500">
                Les hôtels qui génèrent le plus de revenus
              </p>
            </div>
            <BarChart
              labels={topHotels.map(([nom]) => nom)}
              datasets={[
                {
                  label: "Revenus (XOF)",
                  data: topHotels.map(([, revenu]) => revenu),
                  color: "#3b82f6",
                },
              ]}
              horizontal
              height={300}
            />
          </Card>
        )}
      </div>

      {/* ACTIONS RAPIDES */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/hotels/create">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Nouvel hôtel
                  </h3>
                  <p className="text-xs text-slate-600">
                    Créer un hôtel et son propriétaire
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/verifications">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-red-100 rounded-lg text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Vérifications
                  </h3>
                  <p className="text-xs text-slate-600">
                    {stats?.hotelsNonVerifies || 0} hôtels en attente
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/reservations">
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
                    Consulter toutes les résa
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/hotels">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Voir hôtels
                  </h3>
                  <p className="text-xs text-slate-600">
                    Liste complète des hôtels
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* INFO */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Bienvenue dans l&apos;espace administrateur
            </h3>
            <p className="text-sm text-slate-600">
              Depuis ce tableau de bord, vous pouvez gérer tous les aspects de
              la plateforme : hôtels, utilisateurs, réservations, paiements et
              reversements. Utilisez le menu latéral pour naviguer.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}