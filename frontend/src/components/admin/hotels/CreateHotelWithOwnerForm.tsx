"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";
import { Save, Loader2, User, Hotel as HotelIcon, Mail, Copy, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";
import Button from "@/components/shared/ui/Button";
import Card from "@/components/shared/ui/Card";
import ImageUpload from "@/components/shared/ui/ImageUpload";
import Modal from "@/components/shared/ui/Modal";

export default function CreateHotelWithOwnerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [successModal, setSuccessModal] = useState(false);
  const [createdData, setCreatedData] = useState<{
    email: string;
    password: string;
    hotelName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    // Owner
    ownerPrenom: "",
    ownerNom: "",
    ownerEmail: "",
    ownerPhone: "",
    // Hôtel
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      // Owner
      formData.append("ownerEmail", form.ownerEmail);
      formData.append("ownerNom", form.ownerNom);
      formData.append("ownerPrenom", form.ownerPrenom);
      formData.append("ownerPhone", form.ownerPhone);
      // Hôtel
      formData.append("nom", form.nom);
      formData.append("description", form.description);
      formData.append("type", form.type);
      formData.append("etoiles", form.etoiles);
      formData.append("adresse", form.adresse);
      formData.append("ville", form.ville);
      formData.append("telephone", form.telephone);
      formData.append("email", form.email);
      formData.append("fourchettePrix[min]", form.prixMin);
      formData.append("fourchettePrix[max]", form.prixMax);
      // Images
      images.forEach((img) => formData.append("images", img));

      const res = await adminService.createHotelWithOwner(formData);

      setCreatedData({
        email: res.data.owner.email,
        password: res.data.tempPassword || "Envoyé par email",
        hotelName: res.data.hotel.nom,
      });
      setSuccessModal(true);
      toast.success("Hôtel et propriétaire créés !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!createdData) return;
    const text = `Identifiants HotelBenin\nEmail: ${createdData.email}\nMot de passe: ${createdData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section OWNER */}
        <Card>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Informations du propriétaire
              </h2>
              <p className="text-sm text-slate-600">
                Un compte sera créé avec ces informations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              name="ownerPrenom"
              value={form.ownerPrenom}
              onChange={handleChange}
              required
              placeholder="Jean"
            />
            <Input
              label="Nom *"
              name="ownerNom"
              value={form.ownerNom}
              onChange={handleChange}
              required
              placeholder="Kokou"
            />
            <Input
              label="Email *"
              name="ownerEmail"
              type="email"
              value={form.ownerEmail}
              onChange={handleChange}
              required
              placeholder="proprio@monhotel.bj"
              helperText="Les identifiants seront envoyés à cet email"
            />
            <Input
              label="Téléphone"
              name="ownerPhone"
              type="tel"
              value={form.ownerPhone}
              onChange={handleChange}
              placeholder="+229 97 00 00 00"
            />
          </div>
        </Card>

        {/* Section HÔTEL */}
        <Card>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <HotelIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Informations de l&apos;hôtel
              </h2>
              <p className="text-sm text-slate-600">
                Détails de l&apos;établissement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de l'hôtel *"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Hôtel du Lac"
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
                { value: "1", label: "⭐ 1 étoile" },
                { value: "2", label: "⭐⭐ 2 étoiles" },
                { value: "3", label: "⭐⭐⭐ 3 étoiles" },
                { value: "4", label: "⭐⭐⭐⭐ 4 étoiles" },
                { value: "5", label: "⭐⭐⭐⭐⭐ 5 étoiles" },
              ]}
            />
            <Select
  label="Ville *"
  name="ville"
  value={form.ville}
  onChange={handleChange}
  required
  placeholder="Sélectionner une ville"
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
                label="Adresse complète *"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                required
                placeholder="123 avenue de la Paix, Cotonou"
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
                placeholder="Décrivez cet établissement..."
              />
            </div>
            <Input
              label="Téléphone de l'hôtel *"
              name="telephone"
              type="tel"
              value={form.telephone}
              onChange={handleChange}
              required
              placeholder="+229 21 00 00 00"
            />
            <Input
              label="Email de l'hôtel"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contact@hotel.bj"
            />
            <Input
              label="Prix minimum (XOF)"
              name="prixMin"
              type="number"
              value={form.prixMin}
              onChange={handleChange}
              placeholder="35000"
            />
            <Input
              label="Prix maximum (XOF)"
              name="prixMax"
              type="number"
              value={form.prixMax}
              onChange={handleChange}
              placeholder="150000"
            />
          </div>
        </Card>

        {/* Section IMAGES */}
        <Card>
          <ImageUpload
            label="Photos de l'hôtel (jusqu'à 10)"
            onChange={setImages}
            maxFiles={10}
          />
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/hotels")}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {loading ? "Création en cours..." : "Créer l'hôtel et le compte"}
          </Button>
        </div>
      </form>

      {/* Modal de succès */}
      <Modal
        isOpen={successModal}
        onClose={() => {
          setSuccessModal(false);
          router.push("/admin/hotels");
        }}
        title="✅ Hôtel créé avec succès !"
      >
        {createdData && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900">
                  {createdData.hotelName}
                </p>
                <p className="text-sm text-green-700">
                  Le propriétaire a reçu ses identifiants par email
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Identifiants générés
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Email :</span>
                  <p className="font-mono text-slate-900 bg-white px-3 py-1.5 rounded mt-1">
                    {createdData.email}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600">Mot de passe temporaire :</span>
                  <p className="font-mono text-slate-900 bg-white px-3 py-1.5 rounded mt-1">
                    {createdData.password}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={copyCredentials}
                icon={
                  copied ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
                className="mt-3"
              >
                {copied ? "Copié !" : "Copier les identifiants"}
              </Button>
            </div>

            <p className="text-xs text-slate-500 italic">
              ⚠️ Notez ces informations. Le propriétaire devra changer son mot
              de passe à la première connexion.
            </p>

            <Button
              fullWidth
              onClick={() => {
                setSuccessModal(false);
                router.push("/admin/hotels");
              }}
            >
              Retour à la liste
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}