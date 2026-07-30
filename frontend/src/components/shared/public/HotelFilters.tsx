"use client";

import { Search, MapPin, Hotel as HotelIcon, Star, X } from "lucide-react";
import Input from "@/components/shared/ui/Input";
import Select from "@/components/shared/ui/Select";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";

export interface Filters {
  search: string;
  ville: string;
  type: string;
  etoiles: string;
  minPrix: string;
  maxPrix: string;
}

interface HotelFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
}

export default function HotelFilters({
  filters,
  onChange,
  onReset,
}: HotelFiltersProps) {
  const handleChange = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.ville ||
    filters.type ||
    filters.etoiles ||
    filters.minPrix ||
    filters.maxPrix;

  return (
    <Card>
      <div className="space-y-4">
        {/* Barre de recherche */}
        <Input
          placeholder="Rechercher un hôtel..."
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />

        {/* Filtres avancés */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            label="Ville"
            value={filters.ville}
            onChange={(e) => handleChange("ville", e.target.value)}
            placeholder="Toutes les villes"
            options={[
              { value: "Cotonou", label: "📍 Cotonou" },
              { value: "Porto-Novo", label: "📍 Porto-Novo" },
              { value: "Parakou", label: "📍 Parakou" },
              { value: "Abomey", label: "📍 Abomey" },
              { value: "Bohicon", label: "📍 Bohicon" },
              { value: "Natitingou", label: "📍 Natitingou" },
              { value: "Kandi", label: "📍 Kandi" },
              { value: "Ouidah", label: "📍 Ouidah" },
              { value: "Lokossa", label: "📍 Lokossa" },
              { value: "Abomey-Calavi", label: "📍 Abomey-Calavi" },
            ]}
          />

          <Select
            label="Type"
            value={filters.type}
            onChange={(e) => handleChange("type", e.target.value)}
            placeholder="Tous les types"
            options={[
              { value: "hotel", label: "🏨 Hôtel" },
              { value: "auberge", label: "🏡 Auberge" },
              { value: "residence", label: "🏢 Résidence" },
              { value: "guesthouse", label: "🏠 Guesthouse" },
              { value: "camping", label: "⛺ Camping" },
              { value: "appartement", label: "🏙️ Appartement" },
            ]}
          />

          <Select
            label="Étoiles minimum"
            value={filters.etoiles}
            onChange={(e) => handleChange("etoiles", e.target.value)}
            placeholder="Toutes"
            options={[
              { value: "1", label: "⭐ 1+" },
              { value: "2", label: "⭐⭐ 2+" },
              { value: "3", label: "⭐⭐⭐ 3+" },
              { value: "4", label: "⭐⭐⭐⭐ 4+" },
              { value: "5", label: "⭐⭐⭐⭐⭐ 5" },
            ]}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Prix min"
              type="number"
              placeholder="0"
              value={filters.minPrix}
              onChange={(e) => handleChange("minPrix", e.target.value)}
            />
            <Input
              label="Prix max"
              type="number"
              placeholder="500000"
              value={filters.maxPrix}
              onChange={(e) => handleChange("maxPrix", e.target.value)}
            />
          </div>
        </div>

        {/* Reset */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={<X className="w-4 h-4" />}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}