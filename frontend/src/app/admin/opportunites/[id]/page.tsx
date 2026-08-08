"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { opportuniteService, Opportunite, OpportuniteStatut } from "@/services/opportunite.service";
import { Hotel } from "@/types";
import {
  ArrowLeft, Hotel as HotelIcon, Handshake, Building2, Clock, CheckCircle2,
  XCircle, User, Mail, Phone, Calendar, MapPin, DollarSign, FileText,
  Download, Loader2, Eye, AlertCircle, Shield, Star,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import Textarea from "@/components/shared/ui/Textarea";
import Input from "@/components/shared/ui/Input";

export default function AdminOpportuniteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opp, setOpp] = useState<Opportunite | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"none" | "approuver" | "refuser" | "en_cours">("none");
  const [processing, setProcessing] = useState(false);
  const [notesAdmin, setNotesAdmin] = useState("");
  const [motifRefus, setMotifRefus] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await opportuniteService.getById(params.id as string);
      setOpp(res.data?.opportunite || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      router.push("/admin/opportunites");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatut = async (statut: OpportuniteStatut) => {
    if (!opp) return;
    if (statut === "refusee" && !motifRefus.trim()) {
      toast.error("Le motif du refus est obligatoire");
      return;
    }
    setProcessing(true);
    try {
      await opportuniteService.updateStatut(opp._id, statut, notesAdmin || undefined, motifRefus || undefined);
      toast.success(statut === "approuvee" ? "✅ Demande approuvée !" : statut === "refusee" ? "Demande refusée" : "Statut mis à jour");
      router.push("/admin/opportunites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!opp) return null;

  const user = typeof opp.utilisateur === "string" ? null : opp.utilisateur;
  const hotel = typeof opp.hotelCible === "string" ? null : (opp.hotelCible as Hotel | undefined);
  const typeLabels = { proprietaire: "🏨 Devenir Propriétaire", partenaire: "🤝 Devenir Partenaire", construction: "🏗️ Construire un Hôtel" };
  const typeGradients = { proprietaire: "from-purple-500 to-indigo-600", partenaire: "from-blue-500 to-cyan-600", construction: "from-amber-500 to-orange-600" };

  return (
    <div className="space-y-6 max-w-6xl">
      <Link href="/admin/opportunites" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Retour aux opportunités
      </Link>

      <PageHeader title={typeLabels[opp.type]} description={`Demande du ${new Date(opp.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`} />

      {/* Bannière type */}
      <Card className={`bg-gradient-to-br ${typeGradients[opp.type]} border-0 text-white`}>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
            {opp.type === "proprietaire" ? <HotelIcon className="w-8 h-8" /> : opp.type === "partenaire" ? <Handshake className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{typeLabels[opp.type]}</h2>
            {hotel && <p className="text-white/90">Hôtel : {hotel.nom} ({hotel.ville})</p>}
            {opp.nomProjet && <p className="text-white/90">Projet : {opp.nomProjet}</p>}
          </div>
          <Badge variant={opp.statut === "en_attente" ? "warning" : opp.statut === "approuvee" ? "success" : opp.statut === "refusee" ? "danger" : "primary"}>
            {opp.statut.replace("_", " ")}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du projet */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">📋 Détails de la demande</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {opp.typeGestion && <div><p className="text-xs text-slate-500 dark:text-slate-400">Type de gestion</p><p className="font-medium text-slate-900 dark:text-white">{opp.typeGestion}</p></div>}
              {opp.typePartenariat && <div><p className="text-xs text-slate-500 dark:text-slate-400">Type de partenariat</p><p className="font-medium text-slate-900 dark:text-white">{opp.typePartenariat}</p></div>}
              {(opp.budgetEstime ?? 0) > 0 && <div><p className="text-xs text-slate-500 dark:text-slate-400">Budget estimé</p><p className="font-medium text-slate-900 dark:text-white">{(opp.budgetEstime ?? 0).toLocaleString("fr-FR")} XOF</p></div>}
              {(opp.montantInvestissement ?? 0) > 0 && <div><p className="text-xs text-slate-500 dark:text-slate-400">Investissement</p><p className="font-medium text-slate-900 dark:text-white">{(opp.montantInvestissement ?? 0).toLocaleString("fr-FR")} XOF</p></div>}
              {opp.dureePartenariat && <div><p className="text-xs text-slate-500 dark:text-slate-400">Durée</p><p className="font-medium text-slate-900 dark:text-white">{opp.dureePartenariat}</p></div>}
              {opp.villeSouhaitee && <div><p className="text-xs text-slate-500 dark:text-slate-400">Ville</p><p className="font-medium text-slate-900 dark:text-white">{opp.villeSouhaitee}</p></div>}
              {opp.typeHebergement && <div><p className="text-xs text-slate-500 dark:text-slate-400">Type</p><p className="font-medium text-slate-900 dark:text-white">{opp.typeHebergement}</p></div>}
              {(opp.nombreChambresPrevu ?? 0) > 0 && <div><p className="text-xs text-slate-500 dark:text-slate-400">Chambres prévues</p><p className="font-medium text-slate-900 dark:text-white">{opp.nombreChambresPrevu}</p></div>}
              <div><p className="text-xs text-slate-500 dark:text-slate-400">Contact préféré</p><p className="font-medium text-slate-900 dark:text-white">{opp.contactPrefere}</p></div>
              {opp.telephoneContact && <div><p className="text-xs text-slate-500 dark:text-slate-400">Téléphone</p><p className="font-medium text-slate-900 dark:text-white">{opp.telephoneContact}</p></div>}
            </div>
          </Card>

          {/* Motivation */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">💡 Motivation</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">{opp.motivation}</p>
            {opp.experience && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📊 Expérience</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">{opp.experience}</p>
              </div>
            )}
            {opp.descriptionProjet && (
              <div className="mt-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">📝 Description du projet</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">{opp.descriptionProjet}</p>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">📄 Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opp.documents.pieceIdentite && (
                <a href={opp.documents.pieceIdentite} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div><p className="font-medium text-slate-900 dark:text-white">Pièce d&apos;identité</p><p className="text-xs text-blue-600">Voir le document →</p></div>
                </a>
              )}
              {opp.documents.preuveFonds && (
                <a href={opp.documents.preuveFonds} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div><p className="font-medium text-slate-900 dark:text-white">Preuve de fonds</p><p className="text-xs text-green-600">Voir le document →</p></div>
                </a>
              )}
              {opp.documents.businessPlan && (
                <a href={opp.documents.businessPlan} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div><p className="font-medium text-slate-900 dark:text-white">Business Plan</p><p className="text-xs text-purple-600">Voir le document →</p></div>
                </a>
              )}
              {opp.documents.rccm && (
                <a href={opp.documents.rccm} target="_blank" rel="noopener noreferrer" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-3">
                  <Shield className="w-8 h-8 text-orange-600" />
                  <div><p className="font-medium text-slate-900 dark:text-white">RCCM</p><p className="text-xs text-orange-600">Voir le document →</p></div>
                </a>
              )}
            </div>
          </Card>

          {/* Actions (si en attente) */}
          {(opp.statut === "en_attente" || opp.statut === "en_cours") && (
            <Card className="border-2 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/5">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">⚡ Prendre une décision</h3>

              {action === "none" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {opp.statut === "en_attente" && (
                    <Button onClick={() => handleUpdateStatut("en_cours")} className="flex-1 bg-blue-500 hover:bg-blue-600" icon={<Eye className="w-4 h-4" />}>
                      Marquer "En cours d&apos;examen"
                    </Button>
                  )}
                  <Button onClick={() => setAction("approuver")} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500" icon={<CheckCircle2 className="w-4 h-4" />}>
                    Approuver
                  </Button>
                  <Button onClick={() => setAction("refuser")} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500" icon={<XCircle className="w-4 h-4" />}>
                    Refuser
                  </Button>
                </div>
              )}

              {action === "approuver" && (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      {opp.type === "proprietaire" ? "Le compte du demandeur deviendra 'Propriétaire'." : "Le demandeur sera notifié par email."}
                    </p>
                  </div>
                  <Textarea label="Message (facultatif)" value={notesAdmin} onChange={(e) => setNotesAdmin(e.target.value)} rows={3} placeholder="Message pour le demandeur..." />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAction("none")} disabled={processing}>Annuler</Button>
                    <Button onClick={() => handleUpdateStatut("approuvee")} disabled={processing} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                      icon={processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}>
                      {processing ? "Approbation..." : "Confirmer l'approbation"}
                    </Button>
                  </div>
                </div>
              )}

              {action === "refuser" && (
                <div className="space-y-4">
                  <Textarea label="Motif du refus *" value={motifRefus} onChange={(e) => setMotifRefus(e.target.value)} required rows={4} placeholder="Expliquez pourquoi la demande est refusée..." />
                  <Textarea label="Notes internes" value={notesAdmin} onChange={(e) => setNotesAdmin(e.target.value)} rows={2} placeholder="Notes internes..." />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setAction("none")} disabled={processing}>Annuler</Button>
                    <Button onClick={() => handleUpdateStatut("refusee")} disabled={processing || !motifRefus.trim()} className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                      icon={processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}>
                      {processing ? "Refus..." : "Confirmer le refus"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Colonne droite : Infos demandeur */}
        <div className="space-y-6">
          {user && (
            <Card>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><User className="w-5 h-5" /> Demandeur</h3>
              <div className="text-center mb-4">
                {user.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.avatar} alt={user.nom} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-white dark:border-slate-700 shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 shadow-lg">
                    {user.prenom?.[0]}{user.nom?.[0]}
                  </div>
                )}
                <h4 className="font-bold text-slate-900 dark:text-white">{user.prenom} {user.nom}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /><span className="text-slate-700 dark:text-slate-300 truncate">{user.email}</span></div>
                {user.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400" /><span className="text-slate-700 dark:text-slate-300">{user.phone}</span></div>}
                {user.createdAt && (
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span className="text-slate-700 dark:text-slate-300">Membre depuis {new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span></div>
                )}
              </div>
            </Card>
          )}

          {hotel && (
            <Card>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><HotelIcon className="w-5 h-5" /> Hôtel ciblé</h3>
              {hotel.images?.[0] && (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hotel.images[0]} alt={hotel.nom} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <h4 className="font-bold text-slate-900 dark:text-white">{hotel.nom}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {hotel.ville}
                <span className="flex items-center gap-0.5 text-yellow-500 ml-2">
                  {Array.from({ length: hotel.etoiles }).map((_, i) => (<Star key={i} className="w-3 h-3 fill-current" />))}
                </span>
              </p>
              <Link href={`/admin/hotels/${hotel._id}`}>
                <Button variant="outline" size="sm" fullWidth className="mt-3">Voir l&apos;hôtel</Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}