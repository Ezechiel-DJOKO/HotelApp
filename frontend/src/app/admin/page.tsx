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

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminService.getStats();
      setStats(res.data);
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
              la plateforme : hôtels, utilisateurs, réservations et
              vérifications. Utilisez le menu latéral pour naviguer.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}