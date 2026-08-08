"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hotelService } from "@/services/hotel.service";
import { opportuniteService } from "@/services/opportunite.service";
import { Hotel } from "@/types";
import {
  ArrowLeft,
  Hotel as HotelIcon,
  MapPin,
  Star,
  Search,
  CheckCircle2,
  Loader2,
  Send,
  Phone,
  Upload,
  Building2,
  Users,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";

type Step = "choix_hotel" | "formulaire";

export default function DevenirProprietairePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choix_hotel");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [isExterne, setIsExterne] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [preuveFonds, setPreuveFonds] = useState<File | null>(null);

  const [form, setForm] = useState({
    typeGestion: "gerance",
    motivation: "",
    experience: "",
    budgetEstime: "",
    contactPrefere: "email",
    telephoneContact: "",
    // Pour hôtel externe
    hotelExterneNom: "",
    hotelExterneVille: "",
    hotelExterneAdresse: "",
    hotelExterneDescription: "",
    hotelExterneTelephone: "",
  });

  const loadHotels = useCallback(async () => {
    try {
      const res = await hotelService.getHotels({ limit: 100 });
      setHotels(res.data?.hotels || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingHotels(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectHotel = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsExterne(false);
    setStep("formulaire");
  };

  const handleExterne = () => {
    setSelectedHotel(null);
    setIsExterne(true);
    setStep("formulaire");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pieceIdentite) {
      toast.error("La pièce d'identité est obligatoire");
      return;
    }
    if (form.motivation.length < 50) {
      toast.error("La motivation doit contenir au moins 50 caractères");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "proprietaire");
      formData.append("typeGestion", form.typeGestion);
      formData.append("motivation", form.motivation);
      formData.append("experience", form.experience);
      formData.append("budgetEstime", form.budgetEstime);
      formData.append("contactPrefere", form.contactPrefere);
      formData.append("telephoneContact", form.telephoneContact);
      formData.append("pieceIdentite", pieceIdentite);
      if (preuveFonds) formData.append("preuveFonds", preuveFonds);

      if (selectedHotel) {
        formData.append("hotelCible", selectedHotel._id);
      } else if (isExterne) {
        formData.append(
          "hotelExterne",
          JSON.stringify({
            nom: form.hotelExterneNom,
            ville: form.hotelExterneVille,
            adresse: form.hotelExterneAdresse,
            description: form.hotelExterneDescription,
            telephone: form.hotelExterneTelephone,
          })
        );
      }

      await opportuniteService.creer(formData);
      toast.success("🎉 Demande envoyée avec succès !");
      router.push("/client/mes-opportunites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(
    (h) =>
      !search ||
      h.nom.toLowerCase().includes(search.toLowerCase()) ||
      h.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <Link
        href="/client/investir"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux opportunités
      </Link>

      <PageHeader
        title="🏨 Devenir Propriétaire"
        description={
          step === "choix_hotel"
            ? "Choisissez l'hôtel qui vous intéresse"
            : selectedHotel
            ? `Demande pour "${selectedHotel.nom}"`
            : "Proposer un hôtel non listé"
        }
      />

      {/* Étapes */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            step === "choix_hotel"
              ? "bg-purple-600 text-white"
              : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
          }`}
        >
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
            1
          </span>
          Choix de l&apos;hôtel
        </div>
        <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            step === "formulaire"
              ? "bg-purple-600 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
          }`}
        >
          <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
            2
          </span>
          Votre demande
        </div>
      </div>

      {/* ============================================ */}
      {/* ÉTAPE 1 : Choix de l'hôtel */}
      {/* ============================================ */}
      {step === "choix_hotel" && (
        <>
          {/* Recherche */}
          <Card padding="sm">
            <Input
              placeholder="Rechercher un hôtel par nom ou ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </Card>

          {/* Liste des hôtels */}
          {loadingHotels ? (
            <Loader label="Chargement des hôtels..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHotels.map((hotel) => (
                  <button
                    key={hotel._id}
                    onClick={() => handleSelectHotel(hotel)}
                    className="text-left group"
                  >
                    <Card
                      hover
                      className="h-full transition group-hover:border-purple-500 group-hover:shadow-lg"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {hotel.images?.[0] ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={hotel.images[0]}
                              alt={hotel.nom}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <HotelIcon className="w-8 h-8 text-slate-300" />
                            </div>
                          )}
                        </div>

                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition truncate">
                              {hotel.nom}
                            </h3>
                            <div className="flex items-center gap-0.5 text-yellow-500 flex-shrink-0">
                              {Array.from({ length: hotel.etoiles }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 fill-current"
                                  />
                                )
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3" />
                            {hotel.ville} • {hotel.type}
                          </p>
                          {hotel.fourchettePrix?.min > 0 && (
                            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              À partir de{" "}
                              {hotel.fourchettePrix.min.toLocaleString(
                                "fr-FR"
                              )}{" "}
                              XOF/nuit
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>

              {/* Option hôtel non listé */}
              <Card className="border-2 border-dashed border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-500/10">
                <button
                  onClick={handleExterne}
                  className="w-full text-center py-4"
                >
                  <Building2 className="w-12 h-12 text-purple-500 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                    Mon hôtel n&apos;est pas listé
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 max-w-md mx-auto">
                    Votre hôtel est au Bénin mais pas encore sur HotelBenin ?
                    Proposez-le et nous vous accompagnerons.
                  </p>
                  <span className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition">
                    <Building2 className="w-4 h-4" />
                    Proposer un hôtel
                  </span>
                </button>
              </Card>
            </>
          )}
        </>
      )}

      {/* ============================================ */}
      {/* ÉTAPE 2 : Formulaire */}
      {/* ============================================ */}
      {step === "formulaire" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hôtel sélectionné */}
          {selectedHotel && (
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-0 text-white">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {selectedHotel.images?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={selectedHotel.images[0]}
                      alt={selectedHotel.nom}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HotelIcon className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/80 mb-1">
                    Hôtel sélectionné
                  </p>
                  <h3 className="text-xl font-bold">{selectedHotel.nom}</h3>
                  <p className="text-sm text-white/90">
                    📍 {selectedHotel.ville} • {selectedHotel.etoiles} étoiles
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("choix_hotel")}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
                >
                  Changer
                </button>
              </div>
            </Card>
          )}

          {/* Hôtel externe */}
          {isExterne && (
            <Card>
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg text-purple-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Informations de l&apos;hôtel
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Décrivez l&apos;hôtel que vous souhaitez gérer
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("choix_hotel")}
                  className="ml-auto text-sm text-purple-600 hover:underline"
                >
                  ← Choisir un hôtel listé
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom de l'hôtel *"
                  name="hotelExterneNom"
                  value={form.hotelExterneNom}
                  onChange={handleChange}
                  required
                  placeholder="Hôtel du Lac"
                />
                <Input
                  label="Ville *"
                  name="hotelExterneVille"
                  value={form.hotelExterneVille}
                  onChange={handleChange}
                  required
                  placeholder="Cotonou"
                />
                <div className="md:col-span-2">
                  <Input
                    label="Adresse *"
                    name="hotelExterneAdresse"
                    value={form.hotelExterneAdresse}
                    onChange={handleChange}
                    required
                    placeholder="123 avenue de la Paix"
                  />
                </div>
                <Input
                  label="Téléphone"
                  name="hotelExterneTelephone"
                  value={form.hotelExterneTelephone}
                  onChange={handleChange}
                  placeholder="+229 XX XX XX XX"
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    name="hotelExterneDescription"
                    value={form.hotelExterneDescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Décrivez cet hôtel..."
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Type de gestion */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Votre projet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comment souhaitez-vous être impliqué ?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                {
                  value: "rachat",
                  title: "🏷️ Rachat complet",
                  desc: "Acquérir l'hôtel en totalité",
                },
                {
                  value: "gerance",
                  title: "📋 Gérance",
                  desc: "Gérer l'hôtel au quotidien",
                },
                {
                  value: "copropriete",
                  title: "🤝 Copropriété",
                  desc: "Devenir copropriétaire",
                },
                {
                  value: "franchise",
                  title: "🏨 Franchise",
                  desc: "Exploiter sous licence",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, typeGestion: option.value })
                  }
                  className={`p-4 border-2 rounded-lg text-left transition ${
                    form.typeGestion === option.value
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10"
                      : "border-slate-200 dark:border-slate-600 hover:border-purple-300"
                  }`}
                >
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">
                    {option.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Budget estimé (XOF)"
                name="budgetEstime"
                type="number"
                value={form.budgetEstime}
                onChange={handleChange}
                placeholder="Ex: 50 000 000"
              />
              <Select
                label="Contact préféré"
                name="contactPrefere"
                value={form.contactPrefere}
                onChange={handleChange}
                options={[
                  { value: "email", label: "📧 Email" },
                  { value: "telephone", label: "📱 Téléphone" },
                  { value: "whatsapp", label: "💬 WhatsApp" },
                ]}
              />
            </div>

            {(form.contactPrefere === "telephone" ||
              form.contactPrefere === "whatsapp") && (
              <div className="mt-4">
                <Input
                  label="Numéro de téléphone"
                  name="telephoneContact"
                  type="tel"
                  value={form.telephoneContact}
                  onChange={handleChange}
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="+229 XX XX XX XX"
                />
              </div>
            )}
          </Card>

          {/* Motivation */}
          <Card>
            <Textarea
              label={`Pourquoi souhaitez-vous devenir propriétaire ? * (${form.motivation.length}/50 min)`}
              name="motivation"
              value={form.motivation}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Expliquez vos motivations, votre vision pour l'hôtel, ce que vous souhaitez apporter..."
              error={
                form.motivation.length > 0 && form.motivation.length < 50
                  ? `${50 - form.motivation.length} caractères manquants`
                  : undefined
              }
            />

            <div className="mt-4">
              <Textarea
                label="Expérience dans l'hôtellerie (facultatif)"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Années d'expérience, formations, hôtels gérés..."
              />
            </div>
          </Card>

          {/* Documents */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">
              📄 Documents requis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pièce identité */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pièce d&apos;identité *
                </label>
                <label className="cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      pieceIdentite
                        ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                        : "border-slate-300 dark:border-slate-600 hover:border-purple-500"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        pieceIdentite ? "text-green-600" : "text-slate-400"
                      }`}
                    />
                    {pieceIdentite ? (
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        ✅ {pieceIdentite.name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        CNI, Passeport ou Permis
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setPieceIdentite(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preuve de fonds */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Preuve de fonds (facultatif)
                </label>
                <label className="cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      preuveFonds
                        ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                        : "border-slate-300 dark:border-slate-600 hover:border-purple-500"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        preuveFonds ? "text-green-600" : "text-slate-400"
                      }`}
                    />
                    {preuveFonds ? (
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        ✅ {preuveFonds.name}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Relevé bancaire, attestation
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf,.zip,.rar"
                    onChange={(e) =>
                      setPreuveFonds(e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-2">
                  📋 Après l&apos;envoi de votre demande :
                </p>
                <ul className="space-y-1 text-xs">
                  <li>• Notre équipe examine votre dossier sous 48 heures</li>
                  <li>• Un conseiller vous contacte pour discuter du projet</li>
                  <li>• Vérification de vos documents et de votre profil</li>
                  <li>• Si accepté, mise en contact avec le propriétaire actuel</li>
                  <li>• Accompagnement jusqu&apos;à la finalisation</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Boutons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("choix_hotel")}
            >
              ← Retour
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              icon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )
              }
            >
              {loading ? "Envoi en cours..." : "Envoyer ma demande"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}