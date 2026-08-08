"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reservationService } from "@/services/reservation.service";
import { Chambre } from "@/types";
import { useAuthStore } from "@/store/authStore";
import {
  Calendar,
  Users,
  Loader2,
  Send,
  MessageSquare,
  BedDouble,
} from "lucide-react";
import toast from "react-hot-toast";

import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import PaymentModal from "@/components/client/payment/PaymentModal";

interface ReservationFormProps {
  chambre: Chambre;
  onClose: () => void;
}

export default function ReservationForm({
  chambre,
  onClose,
}: ReservationFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  // ============================================
  // ÉTATS
  // ============================================
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [reservationCreated, setReservationCreated] = useState<{
    id: string;
    montant: number;
    hotelNom: string;
    chambreNom: string;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];

  const [form, setForm] = useState({
    dateArrivee: today,
    dateDepart: tomorrow,
    adultes: 1,
    enfants: 0,
    demandesSpeciales: "",
  });

  // ============================================
  // CALCULS
  // ============================================
  const nuits = Math.max(
    1,
    Math.ceil(
      (new Date(form.dateDepart).getTime() -
        new Date(form.dateArrivee).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const prixTotal = nuits * (chambre.prixParNuit || 0);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "number"
        ? parseInt(e.target.value) || 0
        : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour réserver");
      router.push("/auth/login");
      return;
    }

    if (form.adultes < 1) {
      toast.error("Au moins 1 adulte");
      return;
    }

    if (new Date(form.dateArrivee) >= new Date(form.dateDepart)) {
      toast.error("La date de départ doit être après l'arrivée");
      return;
    }

    if (form.adultes + form.enfants > chambre.maxPersonnes) {
      toast.error(
        `Cette chambre accepte maximum ${chambre.maxPersonnes} personnes`
      );
      return;
    }

    setLoading(true);
    try {
      // 1. Créer la réservation
      const res = await reservationService.create({
        chambreId: chambre._id,
        dateArrivee: form.dateArrivee,
        dateDepart: form.dateDepart,
        voyageurs: {
          adultes: form.adultes,
          enfants: form.enfants,
        },
        demandesSpeciales: form.demandesSpeciales || undefined,
      });

      toast.success("Réservation créée ! Procédez au paiement.");

      // 2. Ouvrir le modal de paiement
      setReservationCreated({
        id: res.data.reservation._id,
        montant: prixTotal,
        hotelNom: "Cet hôtel",
        chambreNom: chambre.nom,
      });
      setShowPayment(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setReservationCreated(null);
    onClose();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Résumé chambre */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg text-blue-600">
              <BedDouble className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{chambre.nom}</p>
              <p className="text-sm text-slate-600">
                Jusqu&apos;à {chambre.maxPersonnes} personnes
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-600">Par nuit</p>
              <p className="font-bold text-blue-600">
                {chambre.prixParNuit?.toLocaleString("fr-FR")} XOF
              </p>
            </div>
          </div>
        </Card>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date d'arrivée *"
            name="dateArrivee"
            type="date"
            value={form.dateArrivee}
            onChange={handleChange}
            min={today}
            required
            icon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Date de départ *"
            name="dateDepart"
            type="date"
            value={form.dateDepart}
            onChange={handleChange}
            min={form.dateArrivee}
            required
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Voyageurs */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Adultes *"
            name="adultes"
            type="number"
            value={form.adultes}
            onChange={handleChange}
            min={1}
            max={chambre.maxPersonnes}
            required
            icon={<Users className="w-4 h-4" />}
          />
          <Input
            label="Enfants"
            name="enfants"
            type="number"
            value={form.enfants}
            onChange={handleChange}
            min={0}
            max={chambre.maxPersonnes - 1}
          />
        </div>

        {/* Demandes spéciales */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Demandes spéciales (facultatif)
          </label>
          <Textarea
            name="demandesSpeciales"
            value={form.demandesSpeciales}
            onChange={handleChange}
            rows={3}
            placeholder="Lit double, vue sur mer, arrivée tardive..."
          />
        </div>

        {/* Récap prix */}
        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/90">
                {chambre.prixParNuit?.toLocaleString("fr-FR")} XOF × {nuits}{" "}
                nuit{nuits > 1 ? "s" : ""}
              </span>
              <span className="font-semibold">
                {prixTotal.toLocaleString("fr-FR")} XOF
              </span>
            </div>
            <div className="border-t border-white/20 pt-2 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="text-2xl font-bold">
                {prixTotal.toLocaleString("fr-FR")} XOF
              </span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            icon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )
            }
          >
            {loading
              ? "Traitement..."
              : `Procéder au paiement (${prixTotal.toLocaleString("fr-FR")} XOF)`}
          </Button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          🔒 Paiement 100% sécurisé
          <br />
          Vous recevrez un reçu PDF par email après paiement.
        </p>
      </form>

      {/* Modal de paiement */}
      {reservationCreated && (
        <PaymentModal
          isOpen={showPayment}
          onClose={handleClosePayment}
          reservationId={reservationCreated.id}
          montant={reservationCreated.montant}
          hotelNom={reservationCreated.hotelNom}
          chambreNom={reservationCreated.chambreNom}
        />
      )}
    </>
  );
}