"use client";

import { useState } from "react";
import { avisService } from "@/services/avis.service";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Send, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";

import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import StarRating from "@/components/shared/ui/StarRating";

interface AvisFormProps {
  hotelId: string;
  onSuccess: () => void;
}

export default function AvisForm({ hotelId, onSuccess }: AvisFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    note: 5,
    titre: "",
    commentaire: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Connectez-vous pour laisser un avis");
      router.push("/auth/login");
      return;
    }

    if (form.commentaire.length < 5) {
      toast.error("Votre commentaire doit contenir au moins 5 caractères");
      return;
    }

    setLoading(true);
    try {
      await avisService.create(hotelId, {
        note: form.note,
        titre: form.titre,
        commentaire: form.commentaire,
      });
      toast.success("Merci pour votre avis ! ⭐");
      setForm({ note: 5, titre: "", commentaire: "" });
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Vous devez avoir séjourné dans cet hôtel"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white">
          <Star className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Laisser un avis</h3>
          <p className="text-xs text-slate-500">
            Partagez votre expérience avec les autres voyageurs
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Votre note *
          </label>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <StarRating
              value={form.note}
              onChange={(v) => setForm({ ...form, note: v })}
              size="lg"
            />
            <span className="text-sm text-slate-600">
              {form.note === 5
                ? "Excellent 🤩"
                : form.note === 4
                ? "Très bien 😊"
                : form.note === 3
                ? "Bien 🙂"
                : form.note === 2
                ? "Moyen 😐"
                : "Décevant 😞"}
            </span>
          </div>
        </div>

        {/* Titre */}
        <Input
          label="Titre (facultatif)"
          name="titre"
          value={form.titre}
          onChange={(e) => setForm({ ...form, titre: e.target.value })}
          placeholder="Ex: Excellent séjour"
          maxLength={100}
        />

        {/* Commentaire */}
        <Textarea
          label="Votre commentaire *"
          name="commentaire"
          value={form.commentaire}
          onChange={(e) => setForm({ ...form, commentaire: e.target.value })}
          required
          rows={4}
          placeholder="Racontez votre expérience..."
          helperText={`${form.commentaire.length}/2000 caractères (min. 5)`}
          maxLength={2000}
        />

        <Button
          type="submit"
          disabled={loading}
          fullWidth
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          icon={
            loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )
          }
        >
          {loading ? "Envoi..." : "Publier mon avis"}
        </Button>
      </form>
    </Card>
  );
}