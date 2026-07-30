"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ownerService } from "@/services/owner.service";
import { Chambre } from "@/types";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";
import ImageUpload from "@/components/shared/ui/ImageUpload";

interface ChambreFormProps {
  hotelId: string;
  chambre?: Chambre;
}

export default function ChambreForm({ hotelId, chambre }: ChambreFormProps) {
  const router = useRouter();
  const isEdit = !!chambre;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    chambre?.images || []
  );

  const [form, setForm] = useState({
    nom: chambre?.nom || "",
    type: chambre?.type || "double",
    description: chambre?.description || "",
    prixParNuit: chambre?.prixParNuit ? String(chambre.prixParNuit) : "",
    maxPersonnes: chambre?.maxPersonnes ? String(chambre.maxPersonnes) : "2",
    superficie: chambre?.superficie ? String(chambre.superficie) : "",
    typeLit: chambre?.typeLit || "",
    quantiteTotale: chambre?.quantiteTotale
      ? String(chambre.quantiteTotale)
      : "1",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") formData.append(key, value);
      });
      if (isEdit) {
        formData.append("existingImages", JSON.stringify(existingImages));
      }
      images.forEach((img) => formData.append("images", img));

      if (isEdit && chambre) {
        await ownerService.updateChambre(hotelId, chambre._id, formData);
        toast.success("Chambre modifiée !");
      } else {
        await ownerService.createChambre(hotelId, formData);
        toast.success("Chambre créée !");
      }

      router.push("/owner/hotel/chambres");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h2 className="font-bold text-slate-900 mb-4">
          Informations de la chambre
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de la chambre *"
            name="nom"
            value={form.nom}
            onChange={handleChange}
            required
            placeholder="Chambre Double Deluxe"
          />
          <Select
            label="Type *"
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            options={[
              { value: "simple", label: "Simple" },
              { value: "double", label: "Double" },
              { value: "twin", label: "Twin (2 lits)" },
              { value: "triple", label: "Triple" },
              { value: "suite", label: "Suite" },
              { value: "familiale", label: "Familiale" },
              { value: "vip", label: "VIP" },
              { value: "presidentielle", label: "Présidentielle" },
            ]}
          />
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Décrivez cette chambre..."
            />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-slate-900 mb-4">
          Détails et tarification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prix par nuit (XOF) *"
            name="prixParNuit"
            type="number"
            value={form.prixParNuit}
            onChange={handleChange}
            required
            placeholder="50000"
          />
          <Input
            label="Nombre max de personnes *"
            name="maxPersonnes"
            type="number"
            value={form.maxPersonnes}
            onChange={handleChange}
            required
            min="1"
          />
          <Input
            label="Superficie (m²)"
            name="superficie"
            type="number"
            value={form.superficie}
            onChange={handleChange}
            placeholder="25"
          />
          <Input
            label="Type de lit"
            name="typeLit"
            value={form.typeLit}
            onChange={handleChange}
            placeholder="1 lit king size"
          />
          <Input
            label="Quantité totale disponible *"
            name="quantiteTotale"
            type="number"
            value={form.quantiteTotale}
            onChange={handleChange}
            required
            min="1"
            helperText="Nombre de chambres identiques dans votre hôtel"
          />
        </div>
      </Card>

      <Card>
        <ImageUpload
          label="Photos de la chambre"
          onChange={setImages}
          maxFiles={5}
          existingUrls={existingImages}
          onRemoveExisting={(url) =>
            setExistingImages(existingImages.filter((u) => u !== url))
          }
        />
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/owner/hotel/chambres")}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          icon={
            loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )
          }
        >
          {loading
            ? "Enregistrement..."
            : isEdit
            ? "Modifier"
            : "Créer la chambre"}
        </Button>
      </div>
    </form>
  );
}