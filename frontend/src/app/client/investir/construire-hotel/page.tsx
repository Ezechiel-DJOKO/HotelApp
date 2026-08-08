"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { opportuniteService } from "@/services/opportunite.service";
import {
  ArrowLeft, Building2, MapPin, Loader2, Send, Phone, Upload,
  DollarSign, Info, BedDouble, Sparkles, Shield, Globe,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";

export default function ConstruireHotelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);

  const [form, setForm] = useState({
    nomProjet: "", villeSouhaitee: "", typeHebergement: "hotel",
    nombreChambresPrevu: "", budgetEstime: "", terrainAcquis: "false",
    motivation: "", experience: "", descriptionProjet: "",
    contactPrefere: "email", telephoneContact: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pieceIdentite) { toast.error("Pièce d'identité obligatoire"); return; }
    if (form.motivation.length < 50) { toast.error("Motivation : minimum 50 caractères"); return; }
    if (!form.nomProjet) { toast.error("Nom du projet obligatoire"); return; }
    if (!form.villeSouhaitee) { toast.error("Ville souhaitée obligatoire"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "construction");
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append("pieceIdentite", pieceIdentite);
      if (businessPlan) formData.append("businessPlan", businessPlan);

      await opportuniteService.creer(formData);
      toast.success("🎉 Projet soumis avec succès !");
      router.push("/client/mes-opportunites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/client/investir" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Retour aux opportunités
      </Link>

      <PageHeader title="🏗️ Construire un Hôtel au Bénin" description="HotelBenin vous accompagne de A à Z" />

      {/* Hero */}
      <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10"><Building2 className="w-48 h-48 -mt-12 -mr-12" /></div>
        <div className="relative text-center py-6">
          <Building2 className="w-12 h-12 mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">Créez votre empire hôtelier</h2>
          <p className="text-white/90 max-w-lg mx-auto mb-6">
            Du terrain à l&apos;ouverture, nous vous accompagnons dans chaque étape de votre projet de construction hôtelière au Bénin.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {[
              { icon: <MapPin className="w-5 h-5" />, text: "Recherche terrain" },
              { icon: <Shield className="w-5 h-5" />, text: "Permis & Admin" },
              { icon: <Building2 className="w-5 h-5" />, text: "Construction" },
              { icon: <Globe className="w-5 h-5" />, text: "Mise en ligne" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="flex justify-center mb-1">{item.icon}</div>
                <p className="text-xs font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Infos projet */}
        <Card>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg text-orange-600"><Building2 className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Votre projet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Décrivez votre vision</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nom du projet *" name="nomProjet" value={form.nomProjet} onChange={handleChange} required placeholder="Ex: Hotel Prestige Cotonou" />
            <Select label="Ville souhaitée *" name="villeSouhaitee" value={form.villeSouhaitee} onChange={handleChange} required placeholder="Sélectionner"
              options={["Cotonou","Porto-Novo","Parakou","Abomey","Bohicon","Natitingou","Kandi","Ouidah","Lokossa","Abomey-Calavi"].map(v => ({ value: v, label: `📍 ${v}` }))} />
            <Select label="Type d'hébergement *" name="typeHebergement" value={form.typeHebergement} onChange={handleChange}
              options={[
                { value: "hotel", label: "🏨 Hôtel" }, { value: "auberge", label: "🏡 Auberge" },
                { value: "residence", label: "🏢 Résidence" }, { value: "guesthouse", label: "🏠 Guesthouse" },
                { value: "appartement", label: "🏙️ Appartement" },
              ]} />
            <Input label="Nombre de chambres prévu" name="nombreChambresPrevu" type="number" value={form.nombreChambresPrevu} onChange={handleChange} placeholder="Ex: 50" icon={<BedDouble className="w-4 h-4" />} />
            <Input label="Budget estimé (XOF) *" name="budgetEstime" type="number" value={form.budgetEstime} onChange={handleChange} placeholder="Ex: 500 000 000" icon={<DollarSign className="w-4 h-4" />} />
            <Select label="Terrain déjà acquis ?" name="terrainAcquis" value={form.terrainAcquis} onChange={handleChange}
              options={[{ value: "false", label: "❌ Non, j'ai besoin d'aide" }, { value: "true", label: "✅ Oui, j'ai déjà un terrain" }]} />
          </div>

          <div className="mt-4">
            <Textarea label="Description détaillée du projet *" name="descriptionProjet" value={form.descriptionProjet} onChange={handleChange} rows={5}
              placeholder="Décrivez votre vision : standing, services, cible clientèle, particularités..." />
          </div>
        </Card>

        {/* Motivation */}
        <Card>
          <Textarea label={`Motivation * (${form.motivation.length}/50 min)`} name="motivation" value={form.motivation} onChange={handleChange} required rows={4}
            placeholder="Pourquoi souhaitez-vous construire un hôtel au Bénin ? Quelle est votre vision ?"
            error={form.motivation.length > 0 && form.motivation.length < 50 ? `${50 - form.motivation.length} caractères manquants` : undefined} />
          <div className="mt-4">
            <Textarea label="Expérience (facultatif)" name="experience" value={form.experience} onChange={handleChange} rows={3} placeholder="Votre expérience dans l'hôtellerie, l'immobilier, la gestion..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Select label="Contact préféré" name="contactPrefere" value={form.contactPrefere} onChange={handleChange}
              options={[{ value: "email", label: "📧 Email" }, { value: "telephone", label: "📱 Téléphone" }, { value: "whatsapp", label: "💬 WhatsApp" }]} />
            {form.contactPrefere !== "email" && (
              <Input label="Téléphone" name="telephoneContact" type="tel" value={form.telephoneContact} onChange={handleChange} icon={<Phone className="w-4 h-4" />} placeholder="+229 XX XX XX XX" />
            )}
          </div>
        </Card>

        {/* Documents */}
        <Card>
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">📄 Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="cursor-pointer">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pièce d&apos;identité *</p>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${pieceIdentite ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-slate-300 dark:border-slate-600 hover:border-orange-500"}`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${pieceIdentite ? "text-green-600" : "text-slate-400"}`} />
                <p className="text-sm">{pieceIdentite ? `✅ ${pieceIdentite.name}` : "CNI, Passeport ou Permis"}</p>
              </div>
              <input type="file" accept="image/*,.pdf,.zip,.rar" onChange={(e) => setPieceIdentite(e.target.files?.[0] || null)} className="hidden" />
            </label>
            <label className="cursor-pointer">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Plan (recommandé)</p>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${businessPlan ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-slate-300 dark:border-slate-600 hover:border-orange-500"}`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${businessPlan ? "text-green-600" : "text-slate-400"}`} />
                <p className="text-sm">{businessPlan ? `✅ ${businessPlan.name}` : "PDF du business plan"}</p>
              </div>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setBusinessPlan(e.target.files?.[0] || null)} className="hidden" />
            </label>
          </div>
        </Card>

        {/* Info */}
        <Card className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-2">🏗️ Notre accompagnement comprend :</p>
              <ul className="space-y-1 text-xs">
                <li>• Étude de faisabilité et du marché local</li>
                <li>• Recherche et acquisition du terrain</li>
                <li>• Démarches administratives (permis de construire, etc.)</li>
                <li>• Mise en relation avec des entrepreneurs locaux</li>
                <li>• Suivi de la construction</li>
                <li>• Mise en ligne de l&apos;hôtel sur HotelBenin dès l&apos;ouverture</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/client/investir"><Button variant="outline">← Retour</Button></Link>
          <Button type="submit" disabled={loading} className="bg-gradient-to-r from-amber-500 to-orange-600"
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>
            {loading ? "Envoi..." : "Soumettre mon projet"}
          </Button>
        </div>
      </form>
    </div>
  );
}