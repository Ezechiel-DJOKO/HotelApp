"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { hotelService } from "@/services/hotel.service";
import { Hotel } from "@/types";
import { Hotel as HotelIcon, SlidersHorizontal } from "lucide-react";

import PublicNavbar from "@/components/shared/public/PublicNavbar";
import HotelCard from "@/components/shared/public/HotelCard";
import HotelFilters, {
  Filters,
} from "@/components/shared/public/HotelFilters";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Button from "@/components/shared/ui/Button";

function HotelsListContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    search: "",
    ville: searchParams.get("ville") || "",
    type: "",
    etoiles: "",
    minPrix: "",
    maxPrix: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilters: Record<string, string | number> = {};
      if (filters.ville) apiFilters.ville = filters.ville;
      if (filters.type) apiFilters.type = filters.type;
      if (filters.etoiles) apiFilters.etoiles = Number(filters.etoiles);
      if (filters.minPrix) apiFilters.minPrix = Number(filters.minPrix);
      if (filters.maxPrix) apiFilters.maxPrix = Number(filters.maxPrix);

      const res = await hotelService.getHotels({ ...apiFilters, limit: 50 });
      let hotelsData = res.data?.hotels || [];

      // Filtrage local par nom
      if (filters.search) {
        const search = filters.search.toLowerCase();
        hotelsData = hotelsData.filter(
          (h) =>
            h.nom.toLowerCase().includes(search) ||
            h.description.toLowerCase().includes(search)
        );
      }

      setHotels(hotelsData);
    } catch (error) {
      console.error("Erreur:", error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReset = () => {
    setFilters({
      search: "",
      ville: "",
      type: "",
      etoiles: "",
      minPrix: "",
      maxPrix: "",
    });
  };

  return (
    <>
      <PublicNavbar />

      <main className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Titre */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1">
                🏨 Nos hôtels
              </h1>
              <p className="text-slate-600">
                {loading
                  ? "Chargement..."
                  : `${hotels.length} hôtel${
                      hotels.length > 1 ? "s" : ""
                    } trouvé${hotels.length > 1 ? "s" : ""}`}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<SlidersHorizontal className="w-4 h-4" />}
              className="lg:hidden"
            >
              Filtres
            </Button>
          </div>

          {/* Filtres - visible en desktop, toggle en mobile */}
          <div className={`${showFilters ? "block" : "hidden lg:block"}`}>
            <HotelFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleReset}
            />
          </div>

          {/* Liste */}
          {loading ? (
            <Loader />
          ) : hotels.length === 0 ? (
            <EmptyState
              icon={<HotelIcon className="w-8 h-8" />}
              title="Aucun hôtel trouvé"
              description="Essayez de modifier vos filtres pour trouver plus de résultats."
              action={
                <Button onClick={handleReset}>Réinitialiser les filtres</Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function HotelsListPage() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <HotelsListContent />
    </Suspense>
  );
}