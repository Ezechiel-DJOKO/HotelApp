"use client";

import { useEffect, useState, useCallback } from "react";
import { avisService } from "@/services/avis.service";
import { Avis } from "@/types";
import { Star, MessageSquare, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

import AvisCard from "./AvisCard";
import AvisForm from "./AvisForm";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";
import StarRating from "@/components/shared/ui/StarRating";
import { useAuthStore } from "@/store/authStore";

interface AvisSectionProps {
  hotelId: string;
  noteMoyenne?: number;
  nombreAvis?: number;
}

export default function AvisSection({
  hotelId,
  noteMoyenne = 0,
  nombreAvis = 0,
}: AvisSectionProps) {
  const { user } = useAuthStore();
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async (currentPage = 1) => {
    setLoading(true);
    try {
      const res = await avisService.getAvis(hotelId, currentPage, 5);
      const newAvis = res.data?.avis || [];
      if (currentPage === 1) {
        setAvis(newAvis);
      } else {
        setAvis((prev) => [...prev, ...newAvis]);
      }
      setTotalPages(res.data?.totalPages || 1);
    } catch (error) {
      console.error("Erreur avis:", error);
      setAvis([]);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    load(nextPage);
  };

  const handleAvisPosted = () => {
    setShowForm(false);
    setPage(1);
    load(1);
  };

  const canPostAvis = user?.role === "user";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Avis des voyageurs
          </h2>
          <p className="text-sm text-slate-600">
            {nombreAvis} avis • Note moyenne : {noteMoyenne.toFixed(1)}/5
          </p>
        </div>

        {canPostAvis && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            icon={<Star className="w-4 h-4" />}
          >
            Laisser un avis
          </Button>
        )}
      </div>

      {/* Résumé note moyenne */}
      {nombreAvis > 0 && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-blue-600">
                {noteMoyenne.toFixed(1)}
              </p>
              <p className="text-xs text-slate-600 mt-1">sur 5</p>
            </div>
            <div className="flex-1">
              <StarRating value={noteMoyenne} readonly size="lg" />
              <p className="text-sm text-slate-600 mt-2">
                Basé sur <strong>{nombreAvis}</strong> avis vérifié
                {nombreAvis > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Formulaire */}
      {showForm && canPostAvis && (
        <AvisForm hotelId={hotelId} onSuccess={handleAvisPosted} />
      )}

      {/* Liste des avis */}
      {loading && avis.length === 0 ? (
        <Loader />
      ) : avis.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-8 h-8" />}
          title="Aucun avis pour le moment"
          description={
            canPostAvis
              ? "Soyez le premier à partager votre expérience !"
              : "Aucun voyageur n'a encore laissé d'avis."
          }
        />
      ) : (
        <div className="space-y-4">
          {avis.map((a) => (
            <AvisCard key={a._id} avis={a} />
          ))}

          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loading}
                icon={<ChevronDown className="w-4 h-4" />}
              >
                {loading ? "Chargement..." : "Voir plus d'avis"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}