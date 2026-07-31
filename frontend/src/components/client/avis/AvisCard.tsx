"use client";

import { Avis } from "@/types";
import { CheckCircle } from "lucide-react";
import Card from "@/components/shared/ui/Card";
import Badge from "@/components/shared/ui/Badge";
import StarRating from "@/components/shared/ui/StarRating";

interface AvisCardProps {
  avis: Avis;
}

export default function AvisCard({ avis }: AvisCardProps) {
  return (
    <Card hover>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {avis.utilisateur?.prenom?.charAt(0) || "U"}
          {avis.utilisateur?.nom?.charAt(0) || ""}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900">
              {avis.utilisateur?.prenom} {avis.utilisateur?.nom || "Anonyme"}
            </p>
            {avis.estVerifie && (
              <Badge
                variant="success"
                icon={<CheckCircle className="w-3 h-3" />}
              >
                Vérifié
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={avis.note} readonly size="sm" />
            <span className="text-xs text-slate-500">
              {new Date(avis.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {avis.titre && (
        <h4 className="font-semibold text-slate-900 mb-2">{avis.titre}</h4>
      )}
      <p className="text-slate-700 text-sm leading-relaxed">
        {avis.commentaire}
      </p>
    </Card>
  );
}