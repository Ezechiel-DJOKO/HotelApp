"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Hotel } from "@/types";
import {
  ShieldCheck,
  Hotel as HotelIcon,
  MapPin,
  Star,
  Eye,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

interface HotelWithOwner extends Hotel {
  proprietaire?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function AdminVerificationsPage() {
  const [hotels, setHotels] = useState<HotelWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllHotels();
      const nonVerifies = (
        (res.data?.hotels as HotelWithOwner[]) || []
      ).filter((h) => !h.estVerifie);
      setHotels(nonVerifies);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async (id: string, nom: string) => {
    setVerifying(id);
    try {
      await adminService.verifyHotel(id);
      toast.success(`"${nom}" vérifié avec succès !`);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vérifications en attente"
        description={`${hotels.length} hôtels en attente de vérification`}
      />

      {/* Bannière info */}
      <Card className="border-l-4 border-l-orange-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">
              Processus de vérification
            </h3>
            <p className="text-sm text-slate-600">
              Vérifiez que les informations de l&apos;hôtel sont correctes avant
              de le rendre visible publiquement. Un hôtel vérifié bénéficie d&apos;un
              badge de confiance.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : hotels.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8" />}
          title="Tout est à jour !"
          description="Aucun hôtel en attente de vérification. Tous les établissements sont vérifiés."
          action={
            <Link href="/admin/hotels">
              <Button variant="outline">Voir tous les hôtels</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotels.map((hotel) => (
            <Card
              key={hotel._id}
              padding="none"
              hover
              className="overflow-hidden border-l-4 border-l-orange-500"
            >
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
  {hotel.images?.[0] ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hotel.images[0]}
      alt={hotel.nom}
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center">
      <HotelIcon className="w-12 h-12 text-slate-300" />
    </div>
  )}
                <div className="absolute top-3 left-3">
                  <Badge
                    variant="warning"
                    icon={<Clock className="w-3 h-3" />}
                  >
                    En attente
                  </Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                    {hotel.nom}
                  </h3>
                  <div className="flex items-center gap-0.5 text-yellow-500 flex-shrink-0">
                    {Array.from({ length: hotel.etoiles }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {hotel.ville} • {hotel.type}
                  </span>
                </div>

                {hotel.proprietaire && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Propriétaire
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {hotel.proprietaire.prenom} {hotel.proprietaire.nom}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {hotel.proprietaire.email}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/admin/hotels/${hotel._id}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Examiner
                    </Button>
                  </Link>
                  <Button
                    variant="success"
                    size="sm"
                    disabled={verifying === hotel._id}
                    onClick={() => handleVerify(hotel._id, hotel.nom)}
                    icon={<ShieldCheck className="w-4 h-4" />}
                    className="flex-1"
                  >
                    {verifying === hotel._id ? "Vérification..." : "Vérifier"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}