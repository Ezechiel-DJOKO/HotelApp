"use client";

import { useEffect, useState, useCallback } from "react";
import { paymentService } from "@/services/payment.service";
import { Transaction, TransactionStatut } from "@/types";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  User,
  Hotel as HotelIcon,
  Search,
  Filter,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import StatCard from "@/components/shared/ui/StatCard";
import Input from "@/components/shared/ui/Input";

interface Stats {
  totalTransactions: number;
  revenuTotal: number;
  commissionsTotales: number;
  aReverser: number;
  transactionsReussies: number;
  transactionsEchouees: number;
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
    ville?: string;
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

const statutConfig: Record<
  TransactionStatut,
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
  reussi: {
    label: "Réussi",
    variant: "success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  echoue: {
    label: "Échoué",
    variant: "danger",
    icon: <XCircle className="w-3 h-3" />,
  },
  rembourse: {
    label: "Remboursé",
    variant: "default",
    icon: <XCircle className="w-3 h-3" />,
  },
};

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(
    []
  );
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TransactionStatut | "all">("all");

  const load = useCallback(async () => {
    try {
      const res = await paymentService.getAllTransactions();
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

  if (loading) return <Loader fullPage label="Chargement..." />;

  const filtered = transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.numeroTransaction.toLowerCase().includes(search.toLowerCase()) ||
      t.utilisateur?.nom.toLowerCase().includes(search.toLowerCase()) ||
      t.utilisateur?.prenom.toLowerCase().includes(search.toLowerCase()) ||
      t.hotel?.nom.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || t.statut === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions & Revenus"
        description="Vue d'ensemble des paiements et commissions"
      />

      {/* Stats principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenu total */}
        <Card className="bg-gradient-to-br from-red-500 to-orange-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              GLOBAL
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">Revenu total encaissé</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.revenuTotal || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">XOF</p>
        </Card>

        {/* Commissions */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              COMMISSIONS
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">Vos commissions</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.commissionsTotales || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">XOF (bénéfice net)</p>
        </Card>

        {/* À reverser */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              À VERSER
            </span>
          </div>
          <p className="text-sm text-white/90 mb-1">À reverser aux hôtels</p>
          <p className="text-3xl font-bold mb-1">
            {(stats?.aReverser || 0).toLocaleString("fr-FR")}
          </p>
          <p className="text-xs text-white/80">XOF (en attente)</p>
        </Card>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total transactions"
          value={stats?.totalTransactions || 0}
          icon={<CreditCard className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Réussies"
          value={stats?.transactionsReussies || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="Échouées"
          value={stats?.transactionsEchouees || 0}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          label="Taux de succès"
          value={
            stats?.totalTransactions
              ? `${Math.round(
                  ((stats.transactionsReussies || 0) /
                    stats.totalTransactions) *
                    100
                )}%`
              : "0%"
          }
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par numéro, client ou hôtel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { key: "all", label: "Toutes" },
              { key: "reussi", label: "Réussies" },
              { key: "en_attente", label: "En attente" },
              { key: "echoue", label: "Échouées" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() =>
                  setFilter(f.key as TransactionStatut | "all")
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

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-8 h-8" />}
          title="Aucune transaction"
          description="Les transactions apparaîtront ici dès qu'un client effectuera un paiement."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => {
            const config = statutConfig[t.statut];
            return (
              <Card key={t._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Statut + Numéro */}
                  <div className="flex-shrink-0">
                    <Badge variant={config.variant} icon={config.icon}>
                      {config.label}
                    </Badge>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {t.numeroTransaction}
                    </p>
                    {t.numeroReçu && (
                      <p className="text-xs text-blue-600 font-mono mt-0.5">
                        {t.numeroReçu}
                      </p>
                    )}
                  </div>

                  {/* Détails */}
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
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

                      {/* Hôtel */}
                      {t.hotel && (
                        <div className="flex items-center gap-2 text-sm">
                          <HotelIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">Hôtel</p>
                            <p className="font-medium text-slate-900 truncate">
                              {t.hotel.nom}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Méthode */}
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Méthode</p>
                          <p className="font-medium text-slate-900 truncate">
                            {methodeLabels[t.methode] || t.methode}
                          </p>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="font-medium text-slate-900 text-xs">
                            {new Date(t.createdAt).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Montants */}
                  <div className="lg:border-l lg:border-slate-200 lg:pl-6">
                    <div className="text-right space-y-1">
                      <div>
                        <p className="text-xs text-slate-500">Total client</p>
                        <p className="text-lg font-bold text-slate-900">
                          {t.montantTotal.toLocaleString("fr-FR")} XOF
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-xs text-green-600 font-semibold">
                          + {t.montantCommission.toLocaleString("fr-FR")} XOF
                        </p>
                        <p className="text-xs text-slate-500">
                          Commission ({t.tauxCommission}%)
                        </p>
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <p className="text-xs text-blue-600">
                          → Hôtel : {t.montantHotel.toLocaleString("fr-FR")} XOF
                        </p>
                        {t.reverse ? (
                          <Badge variant="success" className="mt-1">
                            Versé
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="mt-1">
                            À verser
                          </Badge>
                        )}
                      </div>
                    </div>
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