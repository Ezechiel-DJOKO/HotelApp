"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { paymentService } from "@/services/payment.service";
import { Transaction } from "@/types";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  CreditCard,
  Calendar,
  User,
  Hotel as HotelIcon,
  Download,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import StatCard from "@/components/shared/ui/StatCard";

interface Stats {
  totalTransactions: number;
  revenuBrut: number;
  totalCommission: number;
  revenuNet: number;
  deja_verse: number;
  a_recevoir: number;
  en_attente: number;
  deja_paye: number;
}

interface TransactionWithDetails
  extends Omit<Transaction, "reservation" | "utilisateur" | "hotel"> {
  reservation?: {
    _id: string;
    dateArrivee: string;
    dateDepart: string;
    chambre?: { nom: string };
  };
  utilisateur?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  hotel?: {
    _id: string;
    nom: string;
  };
}

const methodeLabels: Record<string, string> = {
  mtn_momo: "MTN MoMo",
  moov_money: "Moov Money",
  orange_money: "Orange Money",
  wave: "Wave",
  carte_visa: "Visa",
  carte_mastercard: "Mastercard",
  demo: "Démo",
};

export default function OwnerRevenusPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "en_attente" | "verse">("all");

  const load = useCallback(async () => {
    try {
      const res = await paymentService.getMesRevenus();
      setTransactions(
        (res.data?.transactions as TransactionWithDetails[]) || []
      );
      setStats(res.data?.stats || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage label="Chargement des revenus..." />;

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "en_attente") return !t.reverse;
    if (filter === "verse") return t.reverse;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Revenus"
        description="Suivez vos gains et vos reversements"
      />

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenu total */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              TOTAL
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">Revenu net total</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.revenuNet || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">XOF (après commission)</p>
        </Card>

        {/* À recevoir */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              EN ATTENTE
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">À recevoir</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.a_recevoir || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">
            XOF ({stats?.en_attente || 0} transaction
            {(stats?.en_attente || 0) > 1 ? "s" : ""})
          </p>
        </Card>

        {/* Déjà versé */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              REÇU
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">Déjà versé</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.deja_verse || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">
            XOF ({stats?.deja_paye || 0} versement
            {(stats?.deja_paye || 0) > 1 ? "s" : ""})
          </p>
        </Card>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Transactions"
          value={stats?.totalTransactions || 0}
          icon={<CreditCard className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Revenu brut"
          value={`${(stats?.revenuBrut || 0).toLocaleString("fr-FR")}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Commissions"
          value={`${(stats?.totalCommission || 0).toLocaleString("fr-FR")}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard
          label="Panier moyen"
          value={
            stats?.totalTransactions
              ? `${Math.round(
                  stats.revenuBrut / stats.totalTransactions
                ).toLocaleString("fr-FR")}`
              : "0"
          }
          icon={<CreditCard className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Info box */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg text-blue-600 flex-shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">
              💡 Comment fonctionnent les reversements ?
            </p>
            <p className="text-sm text-slate-600">
              HotelBenin encaisse les paiements des clients et vous reverse vos
              gains après déduction de la commission (10% pour les hôtels
              1-4 étoiles, 15% pour les 5 étoiles). Les reversements sont
              effectués chaque semaine sur votre compte MoMo/bancaire.
            </p>
          </div>
        </div>
      </Card>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Toutes ({transactions.length})
        </button>
        <button
          onClick={() => setFilter("en_attente")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "en_attente"
              ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          En attente ({stats?.en_attente || 0})
        </button>
        <button
          onClick={() => setFilter("verse")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "verse"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Versés ({stats?.deja_paye || 0})
        </button>
      </div>

      {/* Liste des transactions */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="Aucune transaction"
          description={
            filter === "verse"
              ? "Aucun reversement effectué pour le moment."
              : filter === "en_attente"
              ? "Aucun paiement en attente de reversement."
              : "Aucune transaction pour le moment. Les paiements des clients apparaîtront ici."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((t) => (
            <Card key={t._id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Statut + Numéro */}
                <div className="flex-shrink-0">
                  {t.reverse ? (
                    <Badge
                      variant="success"
                      icon={<CheckCircle2 className="w-3 h-3" />}
                    >
                      Versé
                    </Badge>
                  ) : (
                    <Badge
                      variant="primary"
                      icon={<Clock className="w-3 h-3" />}
                    >
                      En attente
                    </Badge>
                  )}
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    {t.numeroTransaction}
                  </p>
                </div>

                {/* Détails */}
                <div className="flex-1 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Client */}
                    {t.utilisateur && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Client</p>
                          <p className="font-medium text-slate-900 truncate">
                            {t.utilisateur.prenom} {t.utilisateur.nom}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    {t.reservation && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Séjour</p>
                          <p className="font-medium text-slate-900 text-xs">
                            {new Date(
                              t.reservation.dateArrivee
                            ).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })}
                            {" → "}
                            {new Date(
                              t.reservation.dateDepart
                            ).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Méthode */}
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">Paiement</p>
                        <p className="font-medium text-slate-900 truncate">
                          {methodeLabels[t.methode] || t.methode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Montants */}
                <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Montant client</p>
                    <p className="text-sm font-medium text-slate-700 line-through">
                      {t.montantTotal.toLocaleString("fr-FR")} XOF
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      - {t.montantCommission.toLocaleString("fr-FR")} XOF ({t.tauxCommission}%)
                    </p>
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-500">Votre part</p>
                      <p className="text-xl font-bold text-purple-600">
                        {t.montantHotel.toLocaleString("fr-FR")} XOF
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {t.reservation && (
                  <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                    <Link href={`/owner/reservations/${t.reservation._id}`}>
                      <Button variant="outline" size="sm">
                        Voir résa
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}