"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { hotelService } from "@/services/hotel.service";
import { chambreService } from "@/services/chambre.service";
import { Chambre, Hotel } from "@/types";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  ArrowLeft,
  Hotel as HotelIcon,
  BedDouble,
  Share2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PublicNavbar from "@/components/shared/public/PublicNavbar";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import ImageLightbox from "@/components/shared/ui/ImageLightbox";
import Button from "@/components/shared/ui/Button";
import FavoriteButton from "@/components/client/hotels/FavoriteButton";
import ChambreCardPublic from "@/components/client/hotels/ChambreCardPublic";
import AvisSection from "@/components/client/avis/AvisSection";

export default function HotelDetailPublicPage() {
  const params = useParams();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChambres, setLoadingChambres] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await hotelService.getHotel(params.slug as string);
      const foundHotel = res.data?.hotel;
      if (!foundHotel) {
        toast.error("Hôtel introuvable");
        return;
      }
      setHotel(foundHotel);

      // Charger les chambres
      try {
        const chambresRes = await chambreService.getChambres(foundHotel._id);
        setChambres(chambresRes.data?.chambres || []);
      } catch {
        setChambres([]);
      } finally {
        setLoadingChambres(false);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    load();
  }, [load]);

  const handleShare = async () => {
    if (navigator.share && hotel) {
      try {
        await navigator.share({
          title: hotel.nom,
          text: `Découvrez ${hotel.nom} à ${hotel.ville}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  if (loading) return <Loader fullPage />;
  if (!hotel) {
    return (
      <>
        <PublicNavbar />
        <div className="max-w-4xl mx-auto py-20 px-4">
          <EmptyState
            icon={<HotelIcon className="w-8 h-8" />}
            title="Hôtel introuvable"
            description="Cet hôtel n'existe pas ou n'est plus disponible."
            action={
              <Link href="/hotels">
                <Button>Voir tous les hôtels</Button>
              </Link>
            }
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-slate-50 py-6 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Retour */}
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux hôtels
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {hotel.estVerifie && (
                  <Badge
                    variant="success"
                    icon={<CheckCircle className="w-3 h-3" />}
                  >
                    Vérifié
                  </Badge>
                )}
                <Badge variant="default">{hotel.type}</Badge>
                <div className="flex items-center gap-0.5 text-yellow-500 ml-1">
                  {Array.from({ length: hotel.etoiles }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                {hotel.nom}
              </h1>
              <div className="flex items-center gap-1 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {hotel.adresse}, {hotel.ville}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <FavoriteButton hotelId={hotel._id} variant="inline" size="lg" />
              <Button
                variant="outline"
                onClick={handleShare}
                icon={<Share2 className="w-4 h-4" />}
              >
                Partager
              </Button>
            </div>
          </div>

          {/* Galerie */}
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
                <div className="grid grid-cols-4 gap-2 h-80 sm:h-96 lg:h-[500px]">
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
                              <span className="text-xs font-medium">
                                photos
                              </span>
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
              <p className="text-slate-500">Aucune image disponible</p>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  À propos de cet établissement
                </h2>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {hotel.description}
                </p>
              </Card>

              {/* Chambres */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BedDouble className="w-6 h-6" />
                  Chambres disponibles
                </h2>

                {loadingChambres ? (
                  <Loader />
                ) : chambres.length === 0 ? (
                  <EmptyState
                    icon={<BedDouble className="w-8 h-8" />}
                    title="Aucune chambre disponible"
                    description="Cet hôtel n'a pas encore ajouté de chambres. Revenez plus tard."
                  />
                ) : (
                  <div className="space-y-4">
                    {chambres.map((chambre) => (
                      <ChambreCardPublic
                        key={chambre._id}
                        chambre={chambre}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Section Avis */}
                <div className="pt-6 border-t border-slate-200">
                <AvisSection
                    hotelId={hotel._id}
                    noteMoyenne={hotel.note || 0}
                    nombreAvis={hotel.nombreAvis || 0}
                />
                </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Prix + Contact */}
              <Card className="lg:sticky lg:top-24">
                <div className="mb-4">
                  <p className="text-xs text-slate-500">À partir de</p>
                  {hotel.fourchettePrix?.min && hotel.fourchettePrix.min > 0 ? (
                    <p className="text-3xl font-bold text-blue-600">
                        {hotel.fourchettePrix.min.toLocaleString("fr-FR")}
                        <span className="text-sm font-normal text-slate-500 ml-1">
                        XOF/nuit
                        </span>
                    </p>
                    ) : (
                    <p className="text-sm text-slate-500 italic">
                        Voir les prix des chambres
                    </p>
                    )}
                </div>

                {hotel.note > 0 && (
                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                        {hotel.note.toFixed(1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Excellent
                        </p>
                        <p className="text-xs text-slate-500">
                          {hotel.nombreAvis || 0} avis
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <h3 className="font-bold text-slate-900 mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  {hotel.telephone && (
                    <a
                      href={`tel:${hotel.telephone}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition"
                    >
                      <Phone className="w-4 h-4" />
                      {hotel.telephone}
                    </a>
                  )}
                  {hotel.email && (
                    <a
                      href={`mailto:${hotel.email}`}
                      className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{hotel.email}</span>
                    </a>
                  )}
                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {hotel.adresse}, {hotel.ville}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Info */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">
                  ℹ️ Informations
                </h3>
                <p className="text-xs text-slate-600">
                  Sélectionnez une chambre ci-contre et cliquez sur
                  &quot;Réserver&quot; pour envoyer votre demande. L&apos;hôtelier vous
                  confirmera dans les plus brefs délais.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {hotel.images && hotel.images.length > 0 && (
        <ImageLightbox
          images={hotel.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={hotel.nom}
        />
      )}
    </>
  );
}