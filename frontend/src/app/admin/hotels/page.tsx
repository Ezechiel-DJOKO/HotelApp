"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Hotel } from "@/types";
import {
  PlusCircle,
  Hotel as HotelIcon,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  ShieldCheck,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";
import DeleteHotelModal from "@/components/admin/hotels/DeleteHotelModal";

interface HotelWithOwner extends Hotel {
  proprietaire?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "verified" | "unverified" | "inactive"
  >("all");
  const [hotelToDelete, setHotelToDelete] = useState<HotelWithOwner | null>(
    null
  );

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllHotels();
      setHotels((res.data?.hotels as HotelWithOwner[]) || []);
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

  const handleVerify = async (id: string) => {
    try {
      await adminService.verifyHotel(id);
      toast.success("Hôtel vérifié");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await adminService.toggleHotelActive(id);
      toast.success("Statut modifié");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  const filtered = hotels.filter((h) => {
    const matchSearch =
      h.nom.toLowerCase().includes(search.toLowerCase()) ||
      h.ville.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "verified" && h.estVerifie) ||
      (filter === "unverified" && !h.estVerifie) ||
      (filter === "inactive" && !h.estActif);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tous les hôtels"
        description={`${hotels.length} hôtels au total`}
        action={
          <Link href="/admin/hotels/create">
            <Button icon={<PlusCircle className="w-4 h-4" />}>
              Créer un hôtel
            </Button>
          </Link>
        }
      />

      {/* Filtres */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom ou ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: "all", label: "Tous" },
              { key: "verified", label: "Vérifiés" },
              { key: "unverified", label: "Non vérifiés" },
              { key: "inactive", label: "Inactifs" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as typeof filter)}
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

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<HotelIcon className="w-8 h-8" />}
          title="Aucun hôtel"
          description="Créez le premier hôtel de la plateforme."
          action={
            <Link href="/admin/hotels/create">
              <Button icon={<PlusCircle className="w-4 h-4" />}>
                Créer un hôtel
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((hotel) => (
            <Card
              key={hotel._id}
              padding="none"
              hover
              className="overflow-hidden"
            >
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                {hotel.images?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
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
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  {hotel.estVerifie ? (
                    <Badge
                      variant="success"
                      icon={<CheckCircle className="w-3 h-3" />}
                    >
                      Vérifié
                    </Badge>
                  ) : (
                    <Badge variant="warning">Non vérifié</Badge>
                  )}
                  {!hotel.estActif && (
                    <Badge
                      variant="danger"
                      icon={<XCircle className="w-3 h-3" />}
                    >
                      Inactif
                    </Badge>
                  )}
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
                  <span>{hotel.ville}</span>
                </div>

                {hotel.proprietaire && (
                  <div className="mb-3 pb-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500 mb-0.5">
                      Propriétaire
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {hotel.proprietaire.prenom} {hotel.proprietaire.nom}
                    </p>
                    <p className="text-xs text-slate-500">
                      {hotel.proprietaire.email}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/hotels/${hotel._id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Voir
                    </Button>
                  </Link>
                  {!hotel.estVerifie && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleVerify(hotel._id)}
                      icon={<ShieldCheck className="w-4 h-4" />}
                    >
                      Vérifier
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(hotel._id)}
                    icon={
                      hotel.estActif ? (
                        <PowerOff className="w-4 h-4" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )
                    }
                    className={
                      hotel.estActif
                        ? "text-red-600 border-red-200 hover:bg-red-50"
                        : "text-green-600 border-green-200 hover:bg-green-50"
                    }
                  >
                    {hotel.estActif ? "Désactiver" : "Activer"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHotelToDelete(hotel)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de suppression */}
      {hotelToDelete && (
        <DeleteHotelModal
          isOpen={!!hotelToDelete}
          onClose={() => setHotelToDelete(null)}
          hotel={{
            _id: hotelToDelete._id,
            nom: hotelToDelete.nom,
            ville: hotelToDelete.ville,
            etoiles: hotelToDelete.etoiles,
            proprietaire: hotelToDelete.proprietaire,
          }}
          stats={{
            chambres: 0,
            reservations: 0,
            avis: hotelToDelete.nombreAvis || 0,
          }}
          onSuccess={() => {
            setHotelToDelete(null);
            load();
          }}
        />
      )}
    </div>
  );
}