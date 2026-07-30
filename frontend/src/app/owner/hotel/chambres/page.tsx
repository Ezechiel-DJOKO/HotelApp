"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Chambre, Hotel } from "@/types";
import {
  BedDouble,
  PlusCircle,
  Users,
  Edit,
  Trash2,
  Ruler,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

export default function OwnerChambresPage() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const hotelsRes = await ownerService.getMesHotels();
      const monHotel = hotelsRes.data?.hotels?.[0];
      if (!monHotel) {
        toast.error("Aucun hôtel trouvé");
        return;
      }
      setHotel(monHotel);

      const chambresRes = await ownerService.getChambres(monHotel._id);
      setChambres(chambresRes.data?.chambres || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, nom: string) => {
    if (!hotel || !confirm(`Supprimer la chambre "${nom}" ?`)) return;
    try {
      await ownerService.deleteChambre(hotel._id, id);
      toast.success("Chambre supprimée");
      setChambres(chambres.filter((c) => c._id !== id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes Chambres"
        description={`${chambres.length} chambre${
          chambres.length > 1 ? "s" : ""
        } dans votre hôtel`}
        action={
          <Link href="/owner/hotel/chambres/create">
            <Button
              icon={<PlusCircle className="w-4 h-4" />}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Ajouter une chambre
            </Button>
          </Link>
        }
      />

      {chambres.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="w-8 h-8" />}
          title="Aucune chambre"
          description="Ajoutez votre première chambre pour commencer à recevoir des réservations."
          action={
            <Link href="/owner/hotel/chambres/create">
              <Button
                icon={<PlusCircle className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Créer ma première chambre
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chambres.map((chambre) => (
            <Card
              key={chambre._id}
              padding="none"
              hover
              className="overflow-hidden"
            >
              <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
                {chambre.images?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={chambre.images[0]}
                    alt={chambre.nom}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BedDouble className="w-12 h-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant="purple">{chambre.type}</Badge>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">
                  {chambre.nom}
                </h3>

                <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {chambre.maxPersonnes} pers.
                  </span>
                  {chambre.superficie && (
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      {chambre.superficie} m²
                    </span>
                  )}
                </div>

                <div className="mb-4 pb-4 border-b border-slate-100">
                  <p className="text-2xl font-bold text-purple-600">
                    {chambre.prixParNuit?.toLocaleString("fr-FR")}
                    <span className="text-sm font-normal text-slate-500 ml-1">
                      XOF/nuit
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Quantité: {chambre.quantiteTotale || 1}
                  </p>
                </div>

                <div className="flex gap-2">
                <Link href={`/owner/hotel/chambres/${chambre._id}`} className="flex-1">
                    <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Eye className="w-4 h-4" />}
                    >
                    Voir
                    </Button>
                </Link>
                <Link href={`/owner/hotel/chambres/${chambre._id}/edit`}>
                    <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                    </Button>
                </Link>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(chambre._id, chambre.nom)}
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