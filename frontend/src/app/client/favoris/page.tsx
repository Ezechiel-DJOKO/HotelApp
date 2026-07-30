"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { hotelService } from "@/services/hotel.service";
import { Hotel } from "@/types";
import {
  Heart,
  MapPin,
  Star,
  Search,
  Trash2,
  Hotel as HotelIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

export default function ClientFavorisPage() {
  const [favoris, setFavoris] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      // Récupérer les IDs des favoris depuis localStorage
      const favIds = JSON.parse(localStorage.getItem("hotel_favoris") || "[]");

      if (favIds.length === 0) {
        setFavoris([]);
        return;
      }

      // Charger tous les hôtels et filtrer les favoris
      const res = await hotelService.getHotels({ limit: 100 });
      const allHotels = res.data?.hotels || [];
      const favHotels = allHotels.filter((h) => favIds.includes(h._id));
      setFavoris(favHotels);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setFavoris([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = (id: string, nom: string) => {
    if (!confirm(`Retirer "${nom}" de vos favoris ?`)) return;
    const favIds = JSON.parse(localStorage.getItem("hotel_favoris") || "[]");
    const newFavs = favIds.filter((fid: string) => fid !== id);
    localStorage.setItem("hotel_favoris", JSON.stringify(newFavs));
    setFavoris(favoris.filter((h) => h._id !== id));
    toast.success("Retiré des favoris");
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Favoris ❤️"
        description={`${favoris.length} hôtel${
          favoris.length > 1 ? "s" : ""
        } dans vos favoris`}
        action={
          <Link href="/hotels">
            <Button
              icon={<Search className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Explorer plus d&apos;hôtels
            </Button>
          </Link>
        }
      />

      {favoris.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-8 h-8" />}
          title="Aucun favori pour le moment"
          description="Ajoutez des hôtels à vos favoris en cliquant sur le cœur ❤️ lorsque vous naviguez sur nos hôtels."
          action={
            <Link href="/hotels">
              <Button
                icon={<Search className="w-4 h-4" />}
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                Découvrir les hôtels
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favoris.map((hotel) => (
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
                <button
                  onClick={() => handleRemove(hotel._id, hotel.nom)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white text-red-500 hover:text-red-600 transition shadow-md"
                >
                  <Heart className="w-4 h-4 fill-current" />
                </button>
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

                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {hotel.description}
                </p>

                <div className="flex gap-2">
                  <Link href={`/hotels/${hotel.slug}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Voir l&apos;hôtel
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemove(hotel._id, hotel.nom)}
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
    </div>
  );
}