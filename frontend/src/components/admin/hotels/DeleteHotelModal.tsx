"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import {
  X,
  AlertTriangle,
  Loader2,
  Trash2,
  Hotel,
  BedDouble,
  Calendar,
  Star,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface DeleteHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: {
    _id: string;
    nom: string;
    ville: string;
    etoiles: number;
    proprietaire?: {
      nom?: string;
      prenom?: string;
      email?: string;
    };
  };
  stats?: {
    chambres: number;
    reservations: number;
    avis: number;
  };
  onSuccess?: () => void;
}

export default function DeleteHotelModal({
  isOpen,
  onClose,
  hotel,
  stats,
  onSuccess,
}: DeleteHotelModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [raison, setRaison] = useState("");
  const [step, setStep] = useState<"info" | "confirm">("info");

  if (!isOpen) return null;

  const nomExact = hotel.nom.trim();
  const isNameCorrect = confirmName.trim() === nomExact;

  const handleDelete = async () => {
    if (!isNameCorrect) {
      toast.error("Le nom de l'hôtel ne correspond pas");
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.deleteHotel(hotel._id, raison || undefined);
      toast.success(
        `Hôtel "${res.data.hotelSupprime}" supprimé avec succès !`
      );

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        // Rediriger vers la liste des hôtels
        router.push("/admin/hotels");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirmName("");
    setRaison("");
    setStep("info");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-6 relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {step === "info" ? "Supprimer cet hôtel ?" : "Confirmation finale"}
              </h2>
              <p className="text-sm text-white/90">Action irréversible</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "info" ? (
            <>
              {/* Infos hôtel */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Hotel className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{hotel.nom}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>📍 {hotel.ville}</span>
                      <span>•</span>
                      <div className="flex items-center gap-0.5 text-yellow-500">
                        {Array.from({ length: hotel.etoiles }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {hotel.proprietaire && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Propriétaire</p>
                    <p className="text-sm font-medium text-slate-900">
                      {hotel.proprietaire.prenom} {hotel.proprietaire.nom}
                    </p>
                    <p className="text-xs text-slate-500">
                      {hotel.proprietaire.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Ce qui va être supprimé */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-red-900 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Ce qui sera supprimé
                </p>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-center gap-2">
                    <Hotel className="w-4 h-4 flex-shrink-0" />
                    <span>
                      L&apos;hôtel <strong>{hotel.nom}</strong> et toutes ses
                      informations
                    </span>
                  </li>
                  {stats && (
                    <>
                      <li className="flex items-center gap-2">
                        <BedDouble className="w-4 h-4 flex-shrink-0" />
                        <span>
                          <strong>{stats.chambres}</strong> chambre
                          {stats.chambres > 1 ? "s" : ""}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          <strong>{stats.reservations}</strong> réservation
                          {stats.reservations > 1 ? "s" : ""} (annulées + remboursées)
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="w-4 h-4 flex-shrink-0" />
                        <span>
                          <strong>{stats.avis}</strong> avis client
                          {stats.avis > 1 ? "s" : ""}
                        </span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Ce qui sera conservé */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-green-900 text-sm mb-2">
                  ✅ Ce qui sera conservé
                </p>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Le compte du propriétaire (reste actif)</li>
                  <li>• L&apos;historique des transactions (comptabilité)</li>
                  <li>• Les logs d&apos;activité</li>
                </ul>
              </div>

              {/* Conséquences */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-amber-900 text-sm mb-2">
                  ⚠️ Conséquences
                </p>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>
                    • Les clients avec réservations actives seront notifiés par email
                  </li>
                  <li>• Le propriétaire sera notifié par email</li>
                  <li>• Les clients seront remboursés sous 5-7 jours</li>
                  <li>• Cette action est <strong>IRRÉVERSIBLE</strong></li>
                </ul>
              </div>

              {/* Raison (optionnel) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Raison de la suppression (optionnel)
                </label>
                <textarea
                  value={raison}
                  onChange={(e) => setRaison(e.target.value)}
                  rows={3}
                  placeholder="Expliquez pourquoi vous supprimez cet hôtel (sera envoyé au propriétaire)"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Cette raison sera incluse dans l&apos;email au propriétaire
                </p>
              </div>
            </>
          ) : (
            /* Étape 2 : Confirmation avec nom */
            <div>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Dernière étape de confirmation
                </h3>
                <p className="text-sm text-slate-600">
                  Pour confirmer la suppression, tapez le nom exact de
                  l&apos;hôtel ci-dessous.
                </p>
              </div>

              <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-500 mb-1">
                  Nom à taper exactement :
                </p>
                <p className="font-mono font-bold text-slate-900 text-lg select-all">
                  {nomExact}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tapez le nom de l&apos;hôtel
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={nomExact}
                  autoFocus
                  className={`w-full px-3 py-2.5 border-2 rounded-lg outline-none transition font-mono ${
                    confirmName.length > 0
                      ? isNameCorrect
                        ? "border-green-500 bg-green-50 text-green-900"
                        : "border-red-500 bg-red-50 text-red-900"
                      : "border-slate-300"
                  }`}
                />
                {confirmName.length > 0 && !isNameCorrect && (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ Le nom ne correspond pas
                  </p>
                )}
                {isNameCorrect && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Nom correct - vous pouvez confirmer
                  </p>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">
                  <strong>Dernière chance de reculer !</strong>
                  <br />
                  Une fois confirmé, l&apos;hôtel et toutes les données associées
                  seront définitivement supprimés.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex gap-3">
          {step === "info" ? (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Continuer
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("info")}
                disabled={loading}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Retour
              </button>
              <button
                onClick={handleDelete}
                disabled={loading || !isNameCorrect}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}