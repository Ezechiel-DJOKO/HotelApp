"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Hotel } from "@/types";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Hotel as HotelIcon,
  Edit,
  BedDouble,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import ImageLightbox from "@/components/shared/ui/ImageLightbox";

export default function OwnerHotelPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await ownerService.getMesHotels();
      const hotels = res.data?.hotels || [];
      setHotel(hotels[0] || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage />;

  if (!hotel) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Mon Hôtel"
          description="Détails de votre établissement"
        />
        <EmptyState
          icon={<HotelIcon className="w-8 h-8" />}
          title="Aucun hôtel assigné"
          description="Votre hôtel sera créé par l'administrateur. Contactez-le si besoin."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={hotel.nom}
        description={`${hotel.type} • ${hotel.ville}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/owner/hotel/chambres">
              <Button
                variant="outline"
                icon={<BedDouble className="w-4 h-4" />}
              >
                Gérer les chambres
              </Button>
            </Link>
            <Link href="/owner/hotel/edit">
              <Button
                icon={<Edit className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Modifier
              </Button>
            </Link>
          </div>
        }
      />

      {/* Badges statut */}
      <div className="flex flex-wrap gap-2">
        {hotel.estVerifie ? (
          <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
            Vérifié
          </Badge>
        ) : (
          <Badge variant="warning">En attente de vérification</Badge>
        )}
        {hotel.estActif ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
            Inactif
          </Badge>
        )}
        <Badge variant="default">{hotel.type}</Badge>
      </div>

      {/* Galerie d'images */}
      {hotel.images && hotel.images.length > 0 ? (
        <div>
          {hotel.images.length === 1 ? (
            <button
              onClick={() => {
                setLightboxIndex(0);
                setLightboxOpen(true);
              }}
              className="w-full group"
            >
              <Card
                padding="none"
                className="overflow-hidden aspect-video bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hotel.images[0]}
                  alt={hotel.nom}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Card>
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-2 h-80 sm:h-96">
              <button
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="col-span-4 sm:col-span-2 row-span-2 group"
              >
                <Card
                  padding="none"
                  className="overflow-hidden h-full bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hotel.images[0]}
                    alt={hotel.nom}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Card>
              </button>
              {hotel.images.slice(1, 5).map((img, i) => {
                const isLast = i === 3 && hotel.images.length > 5;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setLightboxIndex(i + 1);
                      setLightboxOpen(true);
                    }}
                    className="hidden sm:block col-span-1 row-span-1 group"
                  >
                    <Card
                      padding="none"
                      className="overflow-hidden h-full bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`${hotel.nom} - photo ${i + 2}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                          <span className="text-2xl font-bold">
                            +{hotel.images.length - 5}
                          </span>
                          <span className="text-xs font-medium">photos</span>
                        </div>
                      )}
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
          <button
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
            className="mt-3 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition inline-flex items-center gap-2"
          >
            🖼️ Voir toutes les photos ({hotel.images.length})
          </button>
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <HotelIcon className="w-16 h-16 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">Aucune image</p>
          <Link href="/owner/hotel/edit">
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              icon={<Edit className="w-4 h-4" />}
            >
              Ajouter des photos
            </Button>
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-3">Description</h3>
            <p className="text-slate-700 whitespace-pre-line">
              {hotel.description}
            </p>
          </Card>

          {/* Infos */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Adresse</p>
                <p className="text-sm font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{hotel.adresse}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Étoiles</p>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {Array.from({ length: hotel.etoiles }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              {hotel.telephone && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Téléphone</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {hotel.telephone}
                  </p>
                </div>
              )}
              {hotel.email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {hotel.email}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">Prix minimum</p>
                <p className="text-sm font-medium">
                  {hotel.fourchettePrix?.min?.toLocaleString("fr-FR") || 0} XOF
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Prix maximum</p>
                <p className="text-sm font-medium">
                  {hotel.fourchettePrix?.max?.toLocaleString("fr-FR") || 0} XOF
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Stats rapides */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Note moyenne</span>
                <span className="font-semibold">
                  ⭐ {hotel.note?.toFixed(1) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Nombre d&apos;avis</span>
                <span className="font-semibold">{hotel.nombreAvis || 0}</span>
              </div>
            </div>
          </Card>

          {/* Voir en public */}
          <Link href={`/hotels/${hotel.slug}`} target="_blank">
            <Card hover className="cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-lg">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    Voir en public
                  </p>
                  <p className="text-xs text-slate-600">
                    Aperçu client de votre hôtel
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {hotel.images && hotel.images.length > 0 && (
        <ImageLightbox
          images={hotel.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={hotel.nom}
        />
      )}
    </div>
  );
}