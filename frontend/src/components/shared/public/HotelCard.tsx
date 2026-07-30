"use client";

import Link from "next/link";
import { Hotel } from "@/types";
import {
  MapPin,
  Star,
  Hotel as HotelIcon,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import FavoriteButton from "@/components/client/hotels/FavoriteButton";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  return (
    <Link href={`/hotels/${hotel.slug}`} className="group">
      <Card
        padding="none"
        hover
        className="overflow-hidden h-full flex flex-col"
      >
        <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
          {hotel.images?.[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={hotel.images[0]}
              alt={hotel.nom}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HotelIcon className="w-12 h-12 text-slate-300" />
            </div>
          )}

          <FavoriteButton hotelId={hotel._id} />

          {hotel.estVerifie && (
            <div className="absolute top-3 left-3">
              <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                Vérifié
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
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
            <span className="mx-1">•</span>
            <span className="capitalize">{hotel.type}</span>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
            {hotel.description}
          </p>

          <div className="flex items-end justify-between pt-3 border-t border-slate-100">
            <div>
              {hotel.note > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">
                    {hotel.note.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-xs">
                    ({hotel.nombreAvis || 0} avis)
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">À partir de</p>
              <p className="text-xl font-bold text-blue-600">
                {hotel.fourchettePrix?.min?.toLocaleString("fr-FR") || 0}
                <span className="text-xs font-normal text-slate-500 ml-1">
                  XOF
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}