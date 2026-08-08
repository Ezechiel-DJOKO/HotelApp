"use client";

import { useEffect, useState, useCallback } from "react";
import {
  reversementService,
  HotelAVerser,
  EffectuerReversementData,
} from "@/services/reversement.service";
import {
  Wallet,
  Send,
  Hotel as HotelIcon,
  User,
  Mail,
  Phone,
  CreditCard,
  Loader2,
  CheckCircle2,
  X,
  DollarSign,
  Info,
  History,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";
import Input from "@/components/shared/ui/Input";
import Select from "@/components/shared/ui/Select";
import Textarea from "@/components/shared/ui/Textarea";

export default function AdminReversementsPage() {
  const [hotels, setHotels] = useState<HotelAVerser[]>([]);
  const [totalGeneral, setTotalGeneral] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<HotelAVerser | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<EffectuerReversementData>({
    hotelId: "",
    methode: "mtn_momo",
    referenceExterne: "",
    destinataire: { nom: "", telephone: "", rib: "", banque: "" },
    notes: "",
  });

  const load = useCallback(async () => {
    try {
      const res = await reversementService.getHotelsAVerser();
      setHotels(res.data?.hotels || []);
      setTotalGeneral(res.data?.totalGeneral || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openReversementModal = (hotel: HotelAVerser) => {
    setSelectedHotel(hotel);
    setForm({
      hotelId: hotel.hotel._id,
      methode: "mtn_momo",
      referenceExterne: "",
      destinataire: {
        nom: hotel.owner ? `${hotel.owner.prenom} ${hotel.owner.nom}` : "",
        telephone: hotel.owner?.phone || "",
        rib: "",
        banque: "",
      },
      notes: "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHotel(null);
  };

  const handleSubmit = async () => {
    if (!form.referenceExterne) {
      toast.error("La référence est obligatoire");
      return;
    }

    setSubmitting(true);
    try {
      await reversementService.effectuerReversement(form);
      toast.success("Reversement effectué avec succès ! 💰");
      closeModal();
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage label="Chargement..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reversements aux hôtels"
        description="Effectuez les paiements aux propriétaires"
        action={
          <Link href="/admin/reversements/historique">
            <Button variant="outline" icon={<History className="w-4 h-4" />}>
              Historique
            </Button>
          </Link>
        }
      />

      {/* Total général */}
      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            <Wallet className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/90">Total à reverser</p>
            <p className="text-4xl font-bold">
              {totalGeneral.toLocaleString("fr-FR")} XOF
            </p>
            <p className="text-xs text-white/80 mt-1">
              À {hotels.length} hôtel{hotels.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="bg-amber-50 border-amber-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm mb-1">
              Comment ça marche ?
            </p>
            <p className="text-xs text-amber-800">
              Effectuez le paiement manuellement (MoMo, virement, etc.), puis
              cliquez sur &quot;Effectuer le reversement&quot; pour enregistrer
              la transaction. L&apos;owner sera notifié par email avec un relevé
              PDF.
            </p>
          </div>
        </div>
      </Card>

      {/* Liste hôtels */}
      {hotels.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8" />}
          title="Aucun reversement en attente"
          description="Tous les hôtels sont à jour ! Les nouveaux paiements clients apparaîtront ici."
        />
      ) : (
        <div className="space-y-4">
          {hotels.map((item) => (
            <Card key={item.hotel._id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Info hôtel */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HotelIcon className="w-5 h-5 text-slate-400" />
                    <h3 className="font-bold text-lg text-slate-900">
                      {item.hotel.nom}
                    </h3>
                    <Badge variant="default">{item.hotel.etoiles} ⭐</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">
                    📍 {item.hotel.ville}
                  </p>

                  {item.owner && (
                    <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">
                          {item.owner.prenom} {item.owner.nom}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" />
                        {item.owner.email}
                      </div>
                      {item.owner.phone && (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          {item.owner.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Montant + action */}
                <div className="lg:border-l lg:border-slate-200 lg:pl-6 lg:text-right">
                  <p className="text-xs text-slate-500 mb-1">
                    {item.nombreTransactions} transaction
                    {item.nombreTransactions > 1 ? "s" : ""}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mb-3">
                    {item.montantTotal.toLocaleString("fr-FR")} XOF
                  </p>
                  <Button
                    onClick={() => openReversementModal(item)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500"
                    icon={<Send className="w-4 h-4" />}
                  >
                    Effectuer le reversement
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modalOpen && selectedHotel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6" />
                <h2 className="text-lg font-bold">Effectuer un reversement</h2>
              </div>
              <p className="text-sm opacity-90">{selectedHotel.hotel.nom}</p>
              <p className="text-3xl font-bold mt-2">
                {selectedHotel.montantTotal.toLocaleString("fr-FR")} XOF
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Select
                label="Méthode de paiement *"
                value={form.methode}
                onChange={(e) => setForm({ ...form, methode: e.target.value })}
                options={[
                  { value: "mtn_momo", label: "📱 MTN Mobile Money" },
                  { value: "moov_money", label: "📱 Moov Money" },
                  { value: "orange_money", label: "📱 Orange Money" },
                  { value: "wave", label: "💙 Wave" },
                  { value: "virement_bancaire", label: "🏦 Virement bancaire" },
                  { value: "especes", label: "💵 Espèces" },
                ]}
              />

              <Input
                label="Référence externe *"
                placeholder="Ex: N° transaction MoMo, référence virement..."
                value={form.referenceExterne}
                onChange={(e) =>
                  setForm({ ...form, referenceExterne: e.target.value })
                }
                icon={<CreditCard className="w-4 h-4" />}
              />

              <Input
                label="Téléphone destinataire"
                placeholder="Ex: 97 00 00 00"
                value={form.destinataire?.telephone || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    destinataire: {
                      ...form.destinataire,
                      telephone: e.target.value,
                    },
                  })
                }
                icon={<Phone className="w-4 h-4" />}
              />

              <Textarea
                label="Notes (facultatif)"
                placeholder="Commentaires internes..."
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  ⚠️ En cliquant sur &quot;Confirmer&quot;, vous confirmez avoir
                  effectué le paiement de{" "}
                  <strong>
                    {selectedHotel.montantTotal.toLocaleString("fr-FR")} XOF
                  </strong>{" "}
                  au propriétaire. Cette action est **irréversible**.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <Button variant="outline" onClick={closeModal} fullWidth>
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !form.referenceExterne}
                fullWidth
                className="bg-gradient-to-r from-green-500 to-emerald-500"
                icon={
                  submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )
                }
              >
                {submitting ? "Traitement..." : "Confirmer le reversement"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}