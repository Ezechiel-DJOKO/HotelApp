"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { reservationService } from "@/services/reservation.service";
import { Reservation, ReservationStatut } from "@/types";
import {
  ArrowLeft,
  Calendar,
  Users,
  Hotel,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CheckCheck,
  MessageSquare,
  Phone,
  Mail,
  BedDouble,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";

interface ReservationWithDetails extends Reservation {
  chambre?: {
    _id: string;
    nom: string;
    type?: string;
    images?: string[];
    hotel?: {
      _id: string;
      nom: string;
      ville: string;
      adresse?: string;
      telephone?: string;
      email?: string;
      slug?: string;
      images?: string[];
    };
  };
}

const statutConfig: Record<
  ReservationStatut,
  {
    label: string;
    variant: "warning" | "success" | "danger" | "default";
    icon: React.ReactNode;
    color: string;
    description: string;
  }
> = {
  en_attente: {
    label: "En attente de confirmation",
    variant: "warning",
    icon: <Clock className="w-4 h-4" />,
    color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    description: "Votre demande a été envoyée. L'hôtelier va la traiter sous peu.",
  },
  confirmee: {
    label: "Réservation confirmée",
    variant: "success",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "bg-green-50 border-green-200 text-green-800",
    description: "Super ! Votre réservation est confirmée. Bon séjour !",
  },
  annulee: {
    label: "Réservation annulée",
    variant: "danger",
    icon: <XCircle className="w-4 h-4" />,
    color: "bg-red-50 border-red-200 text-red-800",
    description: "Cette réservation a été annulée.",
  },
  terminee: {
    label: "Séjour terminé",
    variant: "default",
    icon: <CheckCheck className="w-4 h-4" />,
    color: "bg-slate-50 border-slate-200 text-slate-700",
    description: "Merci d'avoir séjourné chez nous ! N'hésitez pas à laisser un avis.",
  },
};

export default function ClientReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [resa, setResa] = useState<ReservationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await reservationService.getMesReservations();
      const found = (res.data?.reservations as ReservationWithDetails[])?.find(
        (r) => r._id === params.id
      );
      if (!found) {
        toast.error("Réservation introuvable");
        router.push("/client");
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
        href="/client"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à mes réservations
      </Link>

      <PageHeader
        title={`Réservation #${resa._id.slice(-6).toUpperCase()}`}
        description="Détails complets de votre réservation"
      />

      {/* Bannière statut */}
      <Card className={`border-l-4 ${config.color.replace("bg-", "border-l-").replace("-50", "-500")}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.color}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900">{config.label}</h3>
              <Badge variant={config.variant} icon={config.icon}>
                {resa.statut.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">{config.description}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Image de l'hôtel */}
          {resa.chambre?.hotel?.images?.[0] && (
            <Card padding="none" className="overflow-hidden">
              <div className="relative w-full h-64 sm:h-80 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resa.chambre.hotel.images[0]}
                  alt={resa.chambre.hotel.nom}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <h2 className="text-white text-2xl font-bold mb-1">
                    {resa.chambre.hotel.nom}
                  </h2>
                  <p className="text-white/90 text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {resa.chambre.hotel.ville}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Votre séjour</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Arrivée
                </p>
                <p className="font-bold text-slate-900">
                  {new Date(resa.dateArrivee).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-cyan-50 rounded-lg">
                <p className="text-xs text-cyan-700 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Départ
                </p>
                <p className="font-bold text-slate-900">
                  {new Date(resa.dateDepart).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 bg-slate-100 rounded-lg text-center">
                <p className="text-xs text-slate-600 font-medium mb-1">
                  Durée
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {nuits}
                </p>
                <p className="text-xs text-slate-600">
                  nuit{nuits > 1 ? "s" : ""}
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
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500">Adultes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {resa.voyageurs.adultes}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-500">Enfants</p>
                <p className="text-2xl font-bold text-slate-900">
                  {resa.voyageurs.enfants}
                </p>
              </div>
            </div>
          </Card>

          {/* Chambre réservée */}
          {resa.chambre && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5" />
                Chambre réservée
              </h3>
              <div className="flex items-center gap-4">
                {resa.chambre.images?.[0] && (
                  <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resa.chambre.images[0]}
                      alt={resa.chambre.nom}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-900">
                    {resa.chambre.nom}
                  </p>
                  {resa.chambre.type && (
                    <Badge variant="primary" className="mt-1">
                      {resa.chambre.type}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Demandes spéciales */}
          {resa.demandesSpeciales && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Vos demandes spéciales
              </h3>
              <p className="text-slate-700 italic p-3 bg-slate-50 rounded-lg">
                &ldquo;{resa.demandesSpeciales}&rdquo;
              </p>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Prix */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
            <p className="text-sm text-white/90 mb-1">Prix total</p>
            <p className="text-4xl font-bold">
              {resa.prixTotal.toLocaleString("fr-FR")}
            </p>
            <p className="text-sm text-white/90 mt-1">XOF</p>
            <p className="text-xs text-white/70 mt-3">
              Pour {nuits} nuit{nuits > 1 ? "s" : ""}
            </p>
          </Card>

          {/* Contact hôtel */}
          {resa.chambre?.hotel && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5" />
                Contact de l&apos;hôtel
              </h3>
              <div className="space-y-3 text-sm">
                {resa.chambre.hotel.adresse && (
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{resa.chambre.hotel.adresse}</span>
                  </div>
                )}
                {resa.chambre.hotel.telephone && (
                  <a
                    href={`tel:${resa.chambre.hotel.telephone}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {resa.chambre.hotel.telephone}
                  </a>
                )}
                {resa.chambre.hotel.email && (
                  <a
                    href={`mailto:${resa.chambre.hotel.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {resa.chambre.hotel.email}
                  </a>
                )}
              </div>
              {resa.chambre.hotel.slug && (
                <Link href={`/hotels/${resa.chambre.hotel.slug}`}>
                  <button className="text-sm text-blue-600 hover:underline mt-4 font-medium">
                    Voir la fiche hôtel →
                  </button>
                </Link>
              )}
            </Card>
          )}

          {/* Aide */}
          <Card className="bg-slate-50 border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2 text-sm">
              💬 Besoin d&apos;aide ?
            </h3>
            <p className="text-xs text-slate-600 mb-3">
              Contactez directement l&apos;hôtelier pour toute question ou
              modification.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}