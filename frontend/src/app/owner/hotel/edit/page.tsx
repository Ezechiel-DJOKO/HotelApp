"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ownerService } from "@/services/owner.service";
import { Hotel } from "@/types";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";
import ImageUpload from "@/components/shared/ui/ImageUpload";
import Loader from "@/components/shared/ui/Loader";

export default function OwnerEditHotelPage() {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    nom: "",
    description: "",
    type: "hotel",
    etoiles: "3",
    adresse: "",
    ville: "",
    telephone: "",
    email: "",
    prixMin: "",
    prixMax: "",
  });

  const load = useCallback(async () => {
    try {
      const res = await ownerService.getMesHotels();
      const found = res.data?.hotels?.[0];
      if (!found) {
        toast.error("Aucun hôtel trouvé");
        router.push("/owner");
        return;
      }
      setHotel(found);
      setForm({
        nom: found.nom,
        description: found.description,
        type: found.type,
        etoiles: String(found.etoiles),
        adresse: found.adresse,
        ville: found.ville,
        telephone: found.telephone || "",
        email: found.email || "",
        prixMin: String(found.fourchettePrix?.min || 0),
        prixMax: String(found.fourchettePrix?.max || 0),
      });
      setExistingImages(found.images || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotel) return;
    setSaving(true);
    try {
      const formData = new FormData();
      
      // Champs texte
      formData.append("nom", form.nom);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("etoiles", form.etoiles);
      formData.append("adresse", form.adresse);
      formData.append("ville", form.ville);
      formData.append("telephone", form.telephone);
      formData.append("email", form.email);
      
      // ✅ Toujours envoyer les prix (même 0)
      formData.append("fourchettePrix[min]", form.prixMin || "0");
      formData.append("fourchettePrix[max]", form.prixMax || "0");
      
      // Images
      formData.append("existingImages", JSON.stringify(existingImages));
      images.forEach((img) => formData.append("images", img));

      await ownerService.updateHotel(hotel._id, formData);
      toast.success("Hôtel modifié !");
      router.push("/owner/hotel");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!hotel) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/owner/hotel"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à mon hôtel
      </Link>

      <PageHeader
        title="Modifier mon hôtel"
        description="Mettez à jour les informations de votre établissement"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="font-bold text-slate-900 mb-4">
            Informations générales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom *"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />
            <Select
              label="Type *"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              options={[
                { value: "hotel", label: "Hôtel" },
                { value: "auberge", label: "Auberge" },
                { value: "residence", label: "Résidence" },
                { value: "guesthouse", label: "Guesthouse" },
                { value: "camping", label: "Camping" },
                { value: "appartement", label: "Appartement" },
              ]}
            />
            <Select
              label="Étoiles *"
              name="etoiles"
              value={form.etoiles}
              onChange={handleChange}
              required
              options={[
                { value: "1", label: "1 étoile" },
                { value: "2", label: "2 étoiles" },
                { value: "3", label: "3 étoiles" },
                { value: "4", label: "4 étoiles" },
                { value: "5", label: "5 étoiles" },
              ]}
            />
            <Select
              label="Ville *"
              name="ville"
              value={form.ville}
              onChange={handleChange}
              required
              options={[
                { value: "Cotonou", label: "Cotonou" },
                { value: "Porto-Novo", label: "Porto-Novo" },
                { value: "Parakou", label: "Parakou" },
                { value: "Abomey", label: "Abomey" },
                { value: "Bohicon", label: "Bohicon" },
                { value: "Natitingou", label: "Natitingou" },
                { value: "Kandi", label: "Kandi" },
                { value: "Ouidah", label: "Ouidah" },
                { value: "Lokossa", label: "Lokossa" },
                { value: "Dogbo", label: "Dogbo" },
                { value: "Savalou", label: "Savalou" },
                { value: "Sakete", label: "Sakete" },
                { value: "Comme", label: "Comme" },
                { value: "Allada", label: "Allada" },
                { value: "Abomey-Calavi", label: "Abomey-Calavi" },
              ]}
            />
            <div className="md:col-span-2">
              <Input
                label="Adresse *"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Textarea
                label="Description *"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>
            <Input
              label="Téléphone *"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Prix min (XOF)"
              name="prixMin"
              type="number"
              value={form.prixMin}
              onChange={handleChange}
            />
            <Input
              label="Prix max (XOF)"
              name="prixMax"
              type="number"
              value={form.prixMax}
              onChange={handleChange}
            />
          </div>
        </Card>

        <Card>
          <ImageUpload
            label="Photos de l'hôtel"
            onChange={setImages}
            maxFiles={10}
            existingUrls={existingImages}
            onRemoveExisting={(url) =>
              setExistingImages(existingImages.filter((u) => u !== url))
            }
          />
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            icon={
              saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}