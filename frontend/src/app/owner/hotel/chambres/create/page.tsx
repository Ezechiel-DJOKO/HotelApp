"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import ChambreForm from "@/components/owner/chambres/ChambreForm";
import Loader from "@/components/shared/ui/Loader";

export default function OwnerCreateChambrePage() {
  const router = useRouter();
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ownerService.getMesHotels();
        const hotel = res.data?.hotels?.[0];
        if (!hotel) {
          toast.error("Aucun hôtel trouvé");
          router.push("/owner");
          return;
        }
        setHotelId(hotel._id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erreur");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) return <Loader fullPage />;
  if (!hotelId) return null;

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
        title="Créer une chambre"
        description="Ajoutez une nouvelle chambre à votre hôtel"
      />

      <ChambreForm hotelId={hotelId} />
    </div>
  );
}