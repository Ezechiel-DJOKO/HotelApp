"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { paymentService } from "@/services/payment.service";
import { PaymentMethod } from "@/types";
import {
  X,
  Loader2,
  Smartphone,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Info,
  ArrowRight,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/shared/ui/Button";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  montant: number;
  hotelNom: string;
  chambreNom: string;
}

type Step = "methode" | "telephone" | "traitement" | "succes" | "echec";

const methodesPaiement = [
  {
    id: "mtn_momo" as PaymentMethod,
    nom: "MTN Mobile Money",
    icon: "📱",
    couleur: "from-yellow-400 to-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    requiresPhone: true,
    description: "Paiement instantané via MTN MoMo",
  },
  {
    id: "moov_money" as PaymentMethod,
    nom: "Moov Money",
    icon: "📱",
    couleur: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    requiresPhone: true,
    description: "Paiement via Moov Money",
  },
  {
    id: "orange_money" as PaymentMethod,
    nom: "Orange Money",
    icon: "📱",
    couleur: "from-orange-400 to-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    requiresPhone: true,
    description: "Paiement via Orange Money",
  },
  {
    id: "wave" as PaymentMethod,
    nom: "Wave",
    icon: "💙",
    couleur: "from-cyan-400 to-blue-500",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    requiresPhone: true,
    description: "Paiement via Wave",
  },
  {
    id: "carte_visa" as PaymentMethod,
    nom: "Carte Visa",
    icon: "💳",
    couleur: "from-blue-600 to-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    requiresPhone: false,
    description: "Paiement par carte bancaire",
  },
  {
    id: "carte_mastercard" as PaymentMethod,
    nom: "Mastercard",
    icon: "💳",
    couleur: "from-red-500 to-orange-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    requiresPhone: false,
    description: "Paiement par Mastercard",
  },
];

export default function PaymentModal({
  isOpen,
  onClose,
  reservationId,
  montant,
  hotelNom,
  chambreNom,
}: PaymentModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("methode");
  const [selectedMethode, setSelectedMethode] =
    useState<PaymentMethod | null>(null);
  const [telephone, setTelephone] = useState("");
  const [loading, setLoading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [numeroReçu, setNumeroReçu] = useState<string | null>(null);

  if (!isOpen) return null;

  const methodeSelectionnee = methodesPaiement.find(
    (m) => m.id === selectedMethode
  );

  const handleSelectMethode = (methode: PaymentMethod) => {
    setSelectedMethode(methode);
    const method = methodesPaiement.find((m) => m.id === methode);
    if (method?.requiresPhone) {
      setStep("telephone");
    } else {
      // Carte : passer direct au traitement (simulation)
      handleConfirmer(methode);
    }
  };

  const handleConfirmer = async (methode?: PaymentMethod) => {
    const methodeToUse = methode || selectedMethode;
    if (!methodeToUse) return;

    const method = methodesPaiement.find((m) => m.id === methodeToUse);

    // Validation téléphone
    if (method?.requiresPhone) {
      if (!telephone || telephone.length < 8) {
        toast.error("Entrez un numéro de téléphone valide");
        return;
      }
    }

    setLoading(true);
    setStep("traitement");
    setErrorMsg("");

    try {
      const res = await paymentService.confirmerPaiement({
        reservationId,
        methode: methodeToUse,
        telephone: method?.requiresPhone ? telephone : undefined,
      });

      // Succès
      // Succès
        setTransactionId(res.data.transaction.receiptUrl.split("/").pop() || "");
        setReceiptUrl(res.data.transaction.receiptUrl);
        setNumeroReçu(res.data.transaction.numeroReçu);  // ⭐ Nouveau
        setStep("succes");
        toast.success("Paiement confirmé ! 🎉");
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Erreur de paiement";
      setErrorMsg(msg);
      setStep("echec");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
  if (step === "succes") {
    router.push("/client");
  }
  setStep("methode");
  setSelectedMethode(null);
  setTelephone("");
  setErrorMsg("");
  setReceiptUrl(null);
  setTransactionId(null);
  setNumeroReçu(null);  // ⭐ Nouveau
  onClose();
};

  const handleTelecharger = async () => {
  if (!transactionId) return;
  try {
    toast.loading("Téléchargement en cours...", { id: "download" });
    await paymentService.telechargerRecu(transactionId, numeroReçu || undefined);
    toast.success("Reçu téléchargé !", { id: "download" });
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : "Erreur téléchargement",
      { id: "download" }
    );
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== "traitement" ? handleClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-6">
          {step !== "traitement" && step !== "succes" && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs opacity-90">Paiement sécurisé</p>
              <h2 className="text-lg font-bold">HotelBenin</h2>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs opacity-90 mb-1">Montant à payer</p>
            <p className="text-3xl font-bold">
              {montant.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs opacity-90 mt-1">
              {hotelNom} • {chambreNom}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ============================================ */}
          {/* ÉTAPE 1 : Choix de la méthode */}
          {/* ============================================ */}
          {step === "methode" && (
            <>
              <h3 className="font-bold text-slate-900 mb-1">
                Choisissez votre mode de paiement
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sélectionnez comment vous souhaitez payer
              </p>

              {/* Badge mode démo */}
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Mode Démonstration</strong>
                  <br />
                  Aucun débit réel ne sera effectué. Ce paiement est simulé.
                </p>
              </div>

              <div className="space-y-2">
                {methodesPaiement.map((methode) => (
                  <button
                    key={methode.id}
                    onClick={() => handleSelectMethode(methode.id)}
                    className={`w-full p-4 border-2 ${methode.borderColor} ${methode.bgColor} rounded-xl hover:shadow-md transition text-left group`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${methode.couleur} rounded-lg flex items-center justify-center text-2xl shadow-md`}
                      >
                        {methode.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {methode.nom}
                        </p>
                        <p className="text-xs text-slate-500">
                          {methode.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ============================================ */}
          {/* ÉTAPE 2 : Téléphone (MoMo) */}
          {/* ============================================ */}
          {step === "telephone" && methodeSelectionnee && (
            <>
              <button
                onClick={() => setStep("methode")}
                className="text-sm text-slate-600 hover:text-slate-900 mb-4"
              >
                ← Changer de méthode
              </button>

              <div className="text-center mb-6">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${methodeSelectionnee.couleur} rounded-2xl flex items-center justify-center text-4xl shadow-lg mx-auto mb-3`}
                >
                  {methodeSelectionnee.icon}
                </div>
                <h3 className="font-bold text-slate-900">
                  {methodeSelectionnee.nom}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Entrez votre numéro de téléphone
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Numéro {methodeSelectionnee.nom.split(" ")[0]}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) =>
                      setTelephone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="97 00 00 00"
                    maxLength={12}
                    autoFocus
                    className="w-full pl-9 pr-3 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg font-medium"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Vous recevrez une notification pour valider le paiement
                </p>
              </div>

              <Button
                onClick={() => handleConfirmer()}
                disabled={!telephone || telephone.length < 8}
                fullWidth
                className="bg-gradient-to-r from-blue-500 to-cyan-500"
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Payer {montant.toLocaleString("fr-FR")} XOF
              </Button>
            </>
          )}

          {/* ============================================ */}
          {/* ÉTAPE 3 : Traitement en cours */}
          {/* ============================================ */}
          {step === "traitement" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                {methodeSelectionnee && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    {methodeSelectionnee.icon}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-slate-900 mb-2">
                Traitement en cours...
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {methodeSelectionnee?.requiresPhone
                  ? "Vérifiez votre téléphone pour valider le paiement"
                  : "Traitement de votre paiement"}
              </p>

              {methodeSelectionnee?.requiresPhone && telephone && (
                <div className="bg-slate-50 rounded-lg p-3 max-w-xs mx-auto">
                  <p className="text-xs text-slate-500">Numéro</p>
                  <p className="font-medium text-slate-900">
                    +229 {telephone}
                  </p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Ne fermez pas cette fenêtre</span>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* ÉTAPE 4 : SUCCÈS */}
          {/* ============================================ */}
          {step === "succes" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Paiement réussi ! 🎉
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Votre réservation a été confirmée
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-900 mb-1">
                      Reçu envoyé par email
                    </p>
                    <p className="text-xs text-green-700">
                      Un email avec votre reçu PDF a été envoyé. Présentez-le
                      à l&apos;hôtel lors de votre arrivée.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleTelecharger}
                  fullWidth
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  📄 Télécharger le reçu PDF
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  fullWidth
                >
                  Voir mes réservations
                </Button>
              </div>
            </div>
          )}

          {/* ============================================ */}
          {/* ÉTAPE 5 : ÉCHEC */}
          {/* ============================================ */}
          {step === "echec" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <X className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Paiement échoué
              </h3>
              <p className="text-sm text-slate-600 mb-4">{errorMsg}</p>

              <div className="space-y-2">
                <Button
                  onClick={() => setStep("methode")}
                  fullWidth
                  className="bg-gradient-to-r from-blue-500 to-cyan-500"
                >
                  Réessayer
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  fullWidth
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer sécurité */}
        {(step === "methode" || step === "telephone") && (
          <div className="border-t border-slate-100 p-4 bg-slate-50">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-3 h-3" />
              <span>Paiement 100% sécurisé</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}