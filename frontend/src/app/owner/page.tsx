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
} from "lucide-react";
import toast from "react-hot-toast";
import { ownerService } from "@/services/owner.service";
import { Hotel as HotelType } from "@/types";

import PageHeader from "@/components/shared/ui/PageHeader";
import StatCard from "@/components/shared/ui/StatCard";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

export default function OwnerDashboardPage() {
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [loading, setLoading] = useState(true);
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

        // Charger les chambres et réservations
        try {
          const [chambresRes, reservationsRes] = await Promise.all([
            ownerService.getChambres(monHotel._id),
            ownerService.getReservationsHotel(monHotel._id),
          ]);

          const chambres = chambresRes.data?.chambres || [];
          const reservations = reservationsRes.data?.reservations || [];

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

      {/* Bannière hôtel */}
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

      {/* Stats */}
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

      {/* Actions rapides */}
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

          <Link href="/owner/statistiques">
            <Card hover className="cursor-pointer h-full">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-green-100 rounded-lg text-green-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Statistiques
                  </h3>
                  <p className="text-xs text-slate-600">
                    Analyses détaillées
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Alerte si pas de chambres */}
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