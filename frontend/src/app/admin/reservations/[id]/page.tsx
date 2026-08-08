"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Reservation, ReservationStatut } from "@/types";
import {
  ArrowLeft,
  Calendar,
  Users,
  Mail,
  Phone,
  Hotel,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  MessageSquare,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";

interface ReservationWithDetails extends Reservation {
  utilisateur?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    phone?: string;
  };
  chambre?: {
    _id: string;
    nom: string;
    hotel?: {
      _id: string;
      nom: string;
      ville: string;
      adresse?: string;
    };
  };
}

const statutConfig: Record<
  ReservationStatut,
  {
    label: string;
    variant: "default" | "primary" | "success" | "warning" | "danger" | "purple";
    icon: React.ReactNode;
  }
> = {
  en_attente: {
    label: "En attente",
    variant: "warning",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmee: {
    label: "Confirmée",
    variant: "success",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  annulee: {
    label: "Annulée",
    variant: "danger",
    icon: <XCircle className="w-4 h-4" />,
  },
  terminee: {
    label: "Terminée",
    variant: "default",
    icon: <CheckCheck className="w-4 h-4" />,
  },
  payee: {
    label: "Payée",
    variant: "primary",
    icon: <CreditCard className="w-3 h-3" />,
  },
};

export default function AdminReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resa, setResa] = useState<ReservationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllReservations();
      const found = (res.data?.reservations as ReservationWithDetails[])?.find(
        (r) => r._id === params.id
      );
      if (!found) {
        toast.error("Réservation introuvable");
        router.push("/admin/reservations");
        return;
      }
      setResa(found);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage />;
  if (!resa) return null;

  const config = statutConfig[resa.statut];
  const nuits = Math.ceil(
    (new Date(resa.dateDepart).getTime() -
      new Date(resa.dateArrivee).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux réservations
      </Link>

      <PageHeader
        title={`Réservation #${resa._id.slice(-6).toUpperCase()}`}
        description="Détails complets de la réservation"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant={config.variant} icon={config.icon}>
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Détails */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dates */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Séjour</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Arrivée
                </p>
                <p className="font-bold text-slate-900">
                  {new Date(resa.dateArrivee).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Départ
                </p>
                <p className="font-bold text-slate-900">
                  {new Date(resa.dateDepart).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-600 font-medium mb-1">
                  Durée
                </p>
                <p className="font-bold text-slate-900">
                  {nuits} nuit{nuits > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Card>

          {/* Voyageurs */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Voyageurs
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Adultes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {resa.voyageurs.adultes}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500">Enfants</p>
                <p className="text-2xl font-bold text-slate-900">
                  {resa.voyageurs.enfants}
                </p>
              </div>
            </div>
          </Card>

          {/* Demandes */}
          {resa.demandesSpeciales && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Demandes spéciales
              </h3>
              <p className="text-slate-700 italic">
                &ldquo;{resa.demandesSpeciales}&rdquo;
              </p>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Prix */}
          <Card>
            <p className="text-xs text-slate-500 mb-1">Prix total</p>
            <p className="text-3xl font-bold text-slate-900">
              {resa.prixTotal.toLocaleString("fr-FR")}
            </p>
            <p className="text-sm text-slate-500">XOF</p>
          </Card>

          {/* Client */}
          {resa.utilisateur && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">Client</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {resa.utilisateur.prenom?.charAt(0)}
                  {resa.utilisateur.nom?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {resa.utilisateur.prenom} {resa.utilisateur.nom}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{resa.utilisateur.email}</span>
                </p>
                {resa.utilisateur.phone && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    {resa.utilisateur.phone}
                  </p>
                )}
              </div>
              <Link href={`/admin/clients/${resa.utilisateur._id}`}>
                <button className="text-sm text-blue-600 hover:underline mt-3">
                  Voir le profil client
                </button>
              </Link>
            </Card>
          )}

          {/* Hôtel */}
          {resa.chambre?.hotel && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Hôtel
              </h3>
              <p className="font-semibold text-slate-900">
                {resa.chambre.hotel.nom}
              </p>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {resa.chambre.hotel.ville}
              </p>
              {resa.chambre.nom && (
                <p className="text-sm text-slate-600 mt-2">
                  Chambre : <span className="font-medium">{resa.chambre.nom}</span>
                </p>
              )}
              <Link href={`/admin/hotels/${resa.chambre.hotel._id}`}>
                <button className="text-sm text-blue-600 hover:underline mt-3">
                  Voir l&apos;hôtel
                </button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}