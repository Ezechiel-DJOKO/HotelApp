"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  demandeProprietaireService,
  DemandeProprietaire,
} from "@/services/demandeProprietaire.service";
import {
  Hotel,
  MapPin,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  Send,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  User,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";

const VILLES = [
  "Cotonou",
  "Porto-Novo",
  "Parakou",
  "Abomey",
  "Bohicon",
  "Natitingou",
  "Kandi",
  "Ouidah",
  "Lokossa",
  "Dogbo",
  "Savalou",
  "Sakete",
  "Comme",
  "Allada",
  "Abomey-Calavi",
];

const TYPES = [
  { value: "hotel", label: "🏨 Hôtel" },
  { value: "auberge", label: "🏡 Auberge" },
  { value: "residence", label: "🏢 Résidence" },
  { value: "guesthouse", label: "🏠 Guesthouse" },
  { value: "camping", label: "⛺ Camping" },
  { value: "appartement", label: "🏙️ Appartement" },
];

export default function DevenirProprietairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingDemandes, setLoadingDemandes] = useState(true);
  const [demandes, setDemandes] = useState<DemandeProprietaire[]>([]);
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [rccm, setRccm] = useState<File | null>(null);

  const [form, setForm] = useState({
    nomHotel: "",
    typeHotel: "hotel",
    ville: "",
    adresse: "",
    description: "",
    telephoneHotel: "",
    emailHotel: "",
    nombreChambres: "",
    motivation: "",
    experience: "",
  });

  useEffect(() => {
    loadMesDemandes();
  }, []);

  const loadMesDemandes = async () => {
    try {
      const res = await demandeProprietaireService.getMesDemandes();
      setDemandes(res.data?.demandes || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingDemandes(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!pieceIdentite) {
      toast.error("Veuillez uploader votre pièce d'identité");
      return;
    }
    if (form.description.length < 50) {
      toast.error("La description doit contenir au moins 50 caractères");
      return;
    }
    if (form.motivation.length < 50) {
      toast.error("La motivation doit contenir au moins 50 caractères");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("pieceIdentite", pieceIdentite);
      if (rccm) formData.append("rccm", rccm);

      await demandeProprietaireService.faireDemande(formData);
      toast.success("🎉 Demande envoyée avec succès !");
      loadMesDemandes();

      // Reset
      setForm({
        nomHotel: "",
        typeHotel: "hotel",
        ville: "",
        adresse: "",
        description: "",
        telephoneHotel: "",
        emailHotel: "",
        nombreChambres: "",
        motivation: "",
        experience: "",
      });
      setPieceIdentite(null);
      setRccm(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDemandes) return <Loader fullPage />;

  const demandeEnAttente = demandes.find((d) => d.statut === "en_attente");
  const derniereDemande = demandes[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/client/profil"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <PageHeader
        title="Devenir Propriétaire"
        description="Rejoignez notre réseau de partenaires hôteliers"
      />

      {/* Bannière motivante */}
      <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10">
          <Hotel className="w-48 h-48 -mt-6 -mr-6" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                Développez votre business
              </h2>
              <p className="text-white/90">
                Rejoignez des centaines d&apos;hôteliers au Bénin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: "💰", label: "Revenus supplémentaires" },
              { icon: "🌍", label: "Visibilité nationale" },
              { icon: "📊", label: "Outils de gestion" },
              { icon: "🤝", label: "Support dédié" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-xs font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Demande en attente */}
      {demandeEnAttente && (
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 mb-1">
                Demande en cours d&apos;examen
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Votre demande pour <strong>&quot;{demandeEnAttente.nomHotel}&quot;</strong>{" "}
                a été envoyée le{" "}
                {new Date(demandeEnAttente.createdAt).toLocaleDateString(
                  "fr-FR",
                  { day: "2-digit", month: "long", year: "numeric" }
                )}
                . Notre équipe l&apos;examine et vous répondra sous 24-48h.
              </p>
              <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
                En attente
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Dernière demande refusée */}
      {!demandeEnAttente &&
        derniereDemande &&
        derniereDemande.statut === "refusee" && (
          <Card className="border-l-4 border-l-red-500 bg-red-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-1">
                  Demande précédente refusée
                </h3>
                <p className="text-sm text-red-800 mb-2">
                  Votre demande pour{" "}
                  <strong>&quot;{derniereDemande.nomHotel}&quot;</strong> a été
                  refusée.
                </p>
                {derniereDemande.motifRefus && (
                  <div className="bg-white p-3 rounded-lg mb-3">
                    <p className="text-xs text-slate-500 mb-1">Motif :</p>
                    <p className="text-sm text-slate-700">
                      {derniereDemande.motifRefus}
                    </p>
                  </div>
                )}
                <p className="text-xs text-red-700">
                  Vous pouvez soumettre une nouvelle demande en corrigeant les
                  points mentionnés.
                </p>
              </div>
            </div>
          </Card>
        )}

      {/* Formulaire */}
      {!demandeEnAttente && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1 : Infos hôtel */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Informations de l&apos;hôtel
                </h3>
                <p className="text-sm text-slate-500">
                  Décrivez votre établissement
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de l'hôtel *"
                name="nomHotel"
                value={form.nomHotel}
                onChange={handleChange}
                required
                placeholder="Ex: Hôtel du Lac"
              />
              <Select
                label="Type *"
                name="typeHotel"
                value={form.typeHotel}
                onChange={handleChange}
                required
                options={TYPES}
              />
              <Select
                label="Ville *"
                name="ville"
                value={form.ville}
                onChange={handleChange}
                required
                placeholder="Sélectionner"
                options={VILLES.map((v) => ({ value: v, label: `📍 ${v}` }))}
              />
              <Input
                label="Nombre de chambres estimé"
                name="nombreChambres"
                type="number"
                value={form.nombreChambres}
                onChange={handleChange}
                placeholder="Ex: 15"
              />
              <div className="md:col-span-2">
                <Input
                  label="Adresse complète *"
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  required
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="123 avenue de la Paix, Cotonou"
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label={`Description de l'établissement * (${form.description.length}/50 min)`}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Décrivez votre hôtel : ambiance, particularités, services, ce qui le rend unique..."
                  error={
                    form.description.length > 0 && form.description.length < 50
                      ? `${50 - form.description.length} caractères manquants`
                      : undefined
                  }
                />
              </div>
              <Input
                label="Téléphone de l'hôtel *"
                name="telephoneHotel"
                type="tel"
                value={form.telephoneHotel}
                onChange={handleChange}
                required
                icon={<Phone className="w-4 h-4" />}
                placeholder="+229 21 XX XX XX"
              />
              <Input
                label="Email de l'hôtel"
                name="emailHotel"
                type="email"
                value={form.emailHotel}
                onChange={handleChange}
                placeholder="contact@monhotel.bj"
              />
            </div>
          </Card>

          {/* Section 2 : Motivation */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="p-2 bg-pink-100 rounded-lg text-pink-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Motivation & Expérience
                </h3>
                <p className="text-sm text-slate-500">
                  Parlez-nous de vous et de votre projet
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Textarea
                label={`Pourquoi souhaitez-vous rejoindre HotelBenin ? * (${form.motivation.length}/50 min)`}
                name="motivation"
                value={form.motivation}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Expliquez vos motivations, vos objectifs, ce que vous souhaitez apporter..."
                error={
                  form.motivation.length > 0 && form.motivation.length < 50
                    ? `${50 - form.motivation.length} caractères manquants`
                    : undefined
                }
              />
              <Textarea
                label="Expérience dans l'hôtellerie (facultatif)"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez votre expérience dans le domaine (nombre d'années, formations, autres hôtels gérés...)"
              />
            </div>
          </Card>

          {/* Section 3 : Documents */}
          <Card>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Documents</h3>
                <p className="text-sm text-slate-500">
                  Pour vérifier votre identité et légitimité
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Pièce d'identité */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pièce d&apos;identité *{" "}
                  <span className="text-xs text-slate-500 font-normal">
                    (CNI, passeport, permis)
                  </span>
                </label>
                <label className="cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      pieceIdentite
                        ? "border-green-500 bg-green-50"
                        : "border-slate-300 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        pieceIdentite ? "text-green-600" : "text-slate-400"
                      }`}
                    />
                    {pieceIdentite ? (
                      <>
                        <p className="text-sm font-semibold text-green-700">
                          ✅ {pieceIdentite.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {(pieceIdentite.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-700">
                          Cliquer pour uploader
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PDF, JPG, PNG (max 5 MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf,.zip,.rar"
                    onChange={(e) =>
                      setPieceIdentite(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* RCCM */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Registre du Commerce (RCCM){" "}
                  <span className="text-xs text-slate-500 font-normal">
                    (facultatif)
                  </span>
                </label>
                <label className="cursor-pointer">
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                      rccm
                        ? "border-green-500 bg-green-50"
                        : "border-slate-300 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        rccm ? "text-green-600" : "text-slate-400"
                      }`}
                    />
                    {rccm ? (
                      <>
                        <p className="text-sm font-semibold text-green-700">
                          ✅ {rccm.name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {(rccm.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-700">
                          Ajouter le RCCM (recommandé)
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Accélère le processus de validation
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setRccm(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </Card>

          {/* Info */}
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">
                  📋 Après l&apos;envoi de votre demande :
                </p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Notre équipe examinera votre dossier sous 24-48h</li>
                  <li>• Vérification de vos documents</li>
                  <li>• Vous serez notifié(e) par email et notification</li>
                  <li>
                    • Si accepté, votre compte deviendra automatiquement
                    &quot;Propriétaire&quot;
                  </li>
                  <li>
                    • L&apos;administrateur créera votre hôtel avec vos infos
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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

      {/* Historique */}
      {demandes.length > 0 && (
        <Card>
          <h3 className="font-bold text-slate-900 mb-4">
            📜 Historique de mes demandes
          </h3>
          <div className="space-y-3">
            {demandes.map((d) => (
              <div
                key={d._id}
                className="p-4 bg-slate-50 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{d.nomHotel}</p>
                  <p className="text-xs text-slate-500">
                    Envoyée le{" "}
                    {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {d.statut === "en_attente" && (
                  <Badge variant="warning" icon={<Clock className="w-3 h-3" />}>
                    En attente
                  </Badge>
                )}
                {d.statut === "approuvee" && (
                  <Badge
                    variant="success"
                    icon={<CheckCircle2 className="w-3 h-3" />}
                  >
                    Approuvée
                  </Badge>
                )}
                {d.statut === "refusee" && (
                  <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
                    Refusée
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}