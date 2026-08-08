"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { hotelService } from "@/services/hotel.service";
import { opportuniteService } from "@/services/opportunite.service";
import { Hotel } from "@/types";
import {
  ArrowLeft,
  Handshake,
  Hotel as HotelIcon,
  MapPin,
  Star,
  Search,
  Loader2,
  Send,
  Phone,
  Upload,
  DollarSign,
  Calendar,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Loader from "@/components/shared/ui/Loader";
import Input from "@/components/shared/ui/Input";
import Textarea from "@/components/shared/ui/Textarea";
import Select from "@/components/shared/ui/Select";

export default function DevenirPartenairePage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [pieceIdentite, setPieceIdentite] = useState<File | null>(null);
  const [businessPlan, setBusinessPlan] = useState<File | null>(null);

  const [form, setForm] = useState({
    typePartenariat: "sponsor",
    montantInvestissement: "",
    dureePartenariat: "12_mois",
    motivation: "",
    experience: "",
    descriptionProjet: "",
    contactPrefere: "email",
    telephoneContact: "",
  });

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await hotelService.getHotels({ limit: 100 });
        setHotels(res.data?.hotels || []);
      } catch (e) { console.error(e); }
      finally { setLoadingHotels(false); }
    };
    loadHotels();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel) { toast.error("Sélectionnez un hôtel"); return; }
    if (!pieceIdentite) { toast.error("La pièce d'identité est obligatoire"); return; }
    if (form.motivation.length < 50) { toast.error("Motivation : minimum 50 caractères"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", "partenaire");
      formData.append("hotelCible", selectedHotel._id);
      formData.append("typePartenariat", form.typePartenariat);
      formData.append("montantInvestissement", form.montantInvestissement);
      formData.append("dureePartenariat", form.dureePartenariat);
      formData.append("motivation", form.motivation);
      formData.append("experience", form.experience);
      formData.append("descriptionProjet", form.descriptionProjet);
      formData.append("contactPrefere", form.contactPrefere);
      formData.append("telephoneContact", form.telephoneContact);
      formData.append("pieceIdentite", pieceIdentite);
      if (businessPlan) formData.append("businessPlan", businessPlan);

      await opportuniteService.creer(formData);
      toast.success("🎉 Demande de partenariat envoyée !");
      router.push("/client/mes-opportunites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(h =>
    !search || h.nom.toLowerCase().includes(search.toLowerCase()) || h.ville.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <Link href="/client/investir" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Retour aux opportunités
      </Link>

      <PageHeader title="🤝 Devenir Partenaire" description={selectedHotel ? `Partenariat pour "${selectedHotel.nom}"` : "Choisissez un hôtel à sponsoriser"} />

      {!selectedHotel ? (
        <>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 text-white">
            <div className="text-center py-4">
              <Handshake className="w-12 h-12 mx-auto mb-3 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">Investissez dans l&apos;hôtellerie béninoise</h2>
              <p className="text-white/90 max-w-lg mx-auto">Sponsorisez un hôtel, investissez dans une rénovation ou développez un partenariat commercial.</p>
            </div>
          </Card>

          <Card padding="sm">
            <Input placeholder="Rechercher un hôtel..." value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
          </Card>

          {loadingHotels ? <Loader /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHotels.map((hotel) => (
                <button key={hotel._id} onClick={() => setSelectedHotel(hotel)} className="text-left group">
                  <Card hover className="h-full transition group-hover:border-blue-500">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {hotel.images?.[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={hotel.images[0]} alt={hotel.nom} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><HotelIcon className="w-8 h-8 text-slate-300" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">{hotel.nom}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {hotel.ville}
                          <span className="flex items-center gap-0.5 text-yellow-500 ml-2">
                            {Array.from({ length: hotel.etoiles }).map((_, i) => (<Star key={i} className="w-3 h-3 fill-current" />))}
                          </span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hôtel sélectionné */}
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg overflow-hidden flex-shrink-0 relative">
                {selectedHotel.images?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={selectedHotel.images[0]} alt={selectedHotel.nom} className="absolute inset-0 w-full h-full object-cover" />
                ) : (<div className="w-full h-full flex items-center justify-center"><HotelIcon className="w-8 h-8 text-white/50" /></div>)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/80">Hôtel sélectionné</p>
                <h3 className="text-xl font-bold">{selectedHotel.nom}</h3>
                <p className="text-sm text-white/90">📍 {selectedHotel.ville} • {selectedHotel.etoiles} étoiles</p>
              </div>
              <button type="button" onClick={() => setSelectedHotel(null)} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg">Changer</button>
            </div>
          </Card>

          {/* Type de partenariat */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Type de partenariat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: "sponsor", title: "🏷️ Sponsor officiel", desc: "Associez votre marque à l'hôtel" },
                { value: "investisseur", title: "💰 Investisseur", desc: "Financez une rénovation ou expansion" },
                { value: "commercial", title: "🤝 Partenaire commercial", desc: "Développez une collaboration business" },
                { value: "technique", title: "🔧 Partenaire technique", desc: "Apportez votre expertise technique" },
              ].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setForm({ ...form, typePartenariat: opt.value })}
                  className={`p-4 border-2 rounded-lg text-left transition ${form.typePartenariat === opt.value ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-600 hover:border-blue-300"}`}>
                  <p className="font-semibold text-slate-900 dark:text-white mb-1">{opt.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Montant d'investissement (XOF)" name="montantInvestissement" type="number" value={form.montantInvestissement} onChange={handleChange} placeholder="Ex: 10 000 000" icon={<DollarSign className="w-4 h-4" />} />
              <Select label="Durée souhaitée" name="dureePartenariat" value={form.dureePartenariat} onChange={handleChange}
                options={[
                  { value: "6_mois", label: "6 mois" }, { value: "12_mois", label: "1 an" },
                  { value: "24_mois", label: "2 ans" }, { value: "36_mois", label: "3 ans" },
                  { value: "indefini", label: "Indéfini" },
                ]} />
            </div>
          </Card>

          {/* Motivation + Contact */}
          <Card>
            <Textarea label={`Motivation * (${form.motivation.length}/50 min)`} name="motivation" value={form.motivation} onChange={handleChange} required rows={5}
              placeholder="Expliquez pourquoi vous souhaitez devenir partenaire de cet hôtel..."
              error={form.motivation.length > 0 && form.motivation.length < 50 ? `${50 - form.motivation.length} caractères manquants` : undefined} />
            <div className="mt-4">
              <Textarea label="Description du projet (facultatif)" name="descriptionProjet" value={form.descriptionProjet} onChange={handleChange} rows={3} placeholder="Détails supplémentaires..." />
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
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${pieceIdentite ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-slate-300 dark:border-slate-600 hover:border-blue-500"}`}>
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${pieceIdentite ? "text-green-600" : "text-slate-400"}`} />
                  <p className="text-sm">{pieceIdentite ? `✅ ${pieceIdentite.name}` : "Cliquer pour uploader"}</p>
                </div>
                <input type="file" accept="image/*,.pdf,.zip,.rar" onChange={(e) => setPieceIdentite(e.target.files?.[0] || null)} className="hidden" />
              </label>
              <label className="cursor-pointer">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Business Plan (facultatif)</p>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${businessPlan ? "border-green-500 bg-green-50 dark:bg-green-500/10" : "border-slate-300 dark:border-slate-600 hover:border-blue-500"}`}>
                  <Upload className={`w-8 h-8 mx-auto mb-2 ${businessPlan ? "text-green-600" : "text-slate-400"}`} />
                  <p className="text-sm">{businessPlan ? `✅ ${businessPlan.name}` : "PDF recommandé"}</p>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setBusinessPlan(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setSelectedHotel(null)}>← Retour</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-cyan-600"
              icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>
              {loading ? "Envoi..." : "Envoyer ma demande"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}