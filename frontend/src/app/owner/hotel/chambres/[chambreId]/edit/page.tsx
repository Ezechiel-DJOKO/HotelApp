"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Chambre } from "@/types";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import ChambreForm from "@/components/owner/chambres/ChambreForm";
import Loader from "@/components/shared/ui/Loader";

export default function OwnerEditChambrePage() {
  const params = useParams();
  const router = useRouter();
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [chambre, setChambre] = useState<Chambre | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader fullPage />;
  if (!hotelId || !chambre) return null;

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
        title={`Modifier : ${chambre.nom}`}
        description="Mettez à jour les informations de la chambre"
      />

      <ChambreForm hotelId={hotelId} chambre={chambre} />
    </div>
  );
}

