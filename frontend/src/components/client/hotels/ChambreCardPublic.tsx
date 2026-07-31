"use client";

import { useState } from "react";
import { Chambre } from "@/types";
import {
  BedDouble,
  Users,
  Ruler,
  Package,
  Calendar,
} from "lucide-react";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import Button from "@/components/shared/ui/Button";
import Modal from "@/components/shared/ui/Modal";
import ImageLightbox from "@/components/shared/ui/ImageLightbox";
import ReservationForm from "@/components/client/reservations/ReservationForm";

interface ChambreCardPublicProps {
  chambre: Chambre;
}

export default function ChambreCardPublic({ chambre }: ChambreCardPublicProps) {
  const [reservModalOpen, setReservModalOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  return (
    <>
      <Card padding="none" hover className="overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="lg:w-64 h-48 lg:h-auto bg-slate-100 relative flex-shrink-0">
            {chambre.images?.[0] ? (
              <button
                onClick={() => {
                  setLightboxIndex(0);
                  setLightboxOpen(true);
                }}
                className="w-full h-full group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={chambre.images[0]}
                  alt={chambre.nom}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {chambre.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    +{chambre.images.length - 1} photos
                  </div>
                )}
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BedDouble className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-bold text-lg text-slate-900 mb-1">
                  {chambre.nom}
                </h3>
                <Badge variant="primary">{chambre.type}</Badge>
              </div>
            </div>

            {chambre.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                {chambre.description}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{chambre.maxPersonnes} pers.</span>
              </div>
              {chambre.superficie && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Ruler className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <span>{chambre.superficie} m²</span>
                </div>
              )}
              {chambre.typeLit && (
                <div className="flex items-center gap-2 text-slate-600">
                  <BedDouble className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="truncate">{chambre.typeLit}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>{chambre.quantiteTotale || 1} dispo</span>
              </div>
            </div>

            <div className="flex items-end justify-between mt-auto pt-3 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500">À partir de</p>
                <p className="text-2xl font-bold text-blue-600">
                  {chambre.prixParNuit?.toLocaleString("fr-FR")}
                  <span className="text-sm font-normal text-slate-500 ml-1">
                    XOF/nuit
                  </span>
                </p>
              </div>
              <Button
                onClick={() => setReservModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                icon={<Calendar className="w-4 h-4" />}
              >
                Réserver
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de réservation */}
      <Modal
        isOpen={reservModalOpen}
        onClose={() => setReservModalOpen(false)}
        title={`Réserver : ${chambre.nom}`}
        size="lg"
      >
        <ReservationForm
          chambre={chambre}
          onClose={() => setReservModalOpen(false)}
        />
      </Modal>

      {/* Lightbox images */}
      {chambre.images && chambre.images.length > 0 && (
        <ImageLightbox
          images={chambre.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={chambre.nom}
        />
      )}
    </>
  );
}