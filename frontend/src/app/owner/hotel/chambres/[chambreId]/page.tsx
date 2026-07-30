"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Chambre } from "@/types";
import {
  ArrowLeft,
  BedDouble,
  Users,
  Ruler,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import ImageLightbox from "@/components/shared/ui/ImageLightbox";

export default function OwnerChambreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [chambre, setChambre] = useState<Chambre | null>(null);
  const [hotelId, setHotelId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const hotelsRes = await ownerService.getMesHotels();
      const hotel = hotelsRes.data?.hotels?.[0];
      if (!hotel) {
        toast.error("Aucun hôtel trouvé");
        router.push("/owner");
        return;
      }
      setHotelId(hotel._id);

      const chambresRes = await ownerService.getChambres(hotel._id);
      const found = chambresRes.data?.chambres?.find(
        (c) => c._id === params.chambreId
      );
      if (!found) {
        toast.error("Chambre introuvable");
        router.push("/owner/hotel/chambres");
        return;
      }
      setChambre(found);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [params.chambreId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!chambre || !confirm(`Supprimer la chambre "${chambre.nom}" ?`)) return;
    try {
      await ownerService.deleteChambre(hotelId, chambre._id);
      toast.success("Chambre supprimée");
      router.push("/owner/hotel/chambres");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  if (loading) return <Loader fullPage />;
  if (!chambre) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/owner/hotel/chambres"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux chambres
      </Link>

      <PageHeader
        title={chambre.nom}
        description={`Chambre ${chambre.type}`}
        action={
          <div className="flex gap-2">
            <Link href={`/owner/hotel/chambres/${chambre._id}/edit`}>
              <Button
                icon={<Edit className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Modifier
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Supprimer
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="purple">{chambre.type}</Badge>
      </div>

      {/* Galerie d'images */}
      {chambre.images && chambre.images.length > 0 ? (
        <div>
          {chambre.images.length === 1 ? (
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
                  src={chambre.images[0]}
                  alt={chambre.nom}
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
                    src={chambre.images[0]}
                    alt={chambre.nom}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Card>
              </button>
              {chambre.images.slice(1, 5).map((img, i) => {
                const isLast = i === 3 && chambre.images.length > 5;
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
                        alt={`${chambre.nom} - photo ${i + 2}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isLast && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                          <span className="text-2xl font-bold">
                            +{chambre.images.length - 5}
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
            🖼️ Voir toutes les photos ({chambre.images.length})
          </button>
        </div>
      ) : (
        <Card padding="lg" className="text-center">
          <BedDouble className="w-16 h-16 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500">Aucune image</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {chambre.description && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-slate-700 whitespace-pre-line">
                {chambre.description}
              </p>
            </Card>
          )}

          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Caractéristiques</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Capacité</p>
                  <p className="font-semibold text-slate-900">
                    {chambre.maxPersonnes} personne
                    {chambre.maxPersonnes > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {chambre.superficie && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Superficie</p>
                    <p className="font-semibold text-slate-900">
                      {chambre.superficie} m²
                    </p>
                  </div>
                </div>
              )}

              {chambre.typeLit && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                    <BedDouble className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Type de lit</p>
                    <p className="font-semibold text-slate-900">
                      {chambre.typeLit}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Quantité disponible</p>
                  <p className="font-semibold text-slate-900">
                    {chambre.quantiteTotale || 1} chambre
                    {(chambre.quantiteTotale || 1) > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {chambre.equipements && chambre.equipements.length > 0 && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">Équipements</h3>
              <div className="flex flex-wrap gap-2">
                {chambre.equipements.map((eq, i) => (
                  <Badge key={i} variant="default">
                    ✓ {eq}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Colonne latérale : Prix */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <p className="text-sm text-white/90 mb-1">Prix par nuit</p>
            <p className="text-4xl font-bold">
              {chambre.prixParNuit?.toLocaleString("fr-FR")}
            </p>
            <p className="text-sm text-white/90 mt-1">XOF</p>
          </Card>

          <Card>
            <h3 className="font-bold text-slate-900 mb-3">Disponibilité</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold">
                  {chambre.quantiteTotale || 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Disponibles</span>
                <span className="font-semibold text-green-600">
                  {chambre.quantiteDisponible ?? chambre.quantiteTotale ?? 1}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {chambre.images && chambre.images.length > 0 && (
        <ImageLightbox
          images={chambre.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={chambre.nom}
        />
      )}
    </div>
  );
}