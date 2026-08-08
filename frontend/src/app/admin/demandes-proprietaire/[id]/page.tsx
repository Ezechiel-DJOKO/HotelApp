"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  demandeProprietaireService,
  DemandeProprietaire,
} from "@/services/demandeProprietaire.service";
import {
  ArrowLeft,
  Hotel,
  MapPin,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Loader2,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Users,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import Textarea from "@/components/shared/ui/Textarea";

export default function AdminDemandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [demande, setDemande] = useState<DemandeProprietaire | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<"none" | "approuver" | "refuser">(
    "none"
  );
  const [processing, setProcessing] = useState(false);
  const [notesAdmin, setNotesAdmin] = useState("");
  const [motifRefus, setMotifRefus] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await demandeProprietaireService.getDemande(
        params.id as string
      );
      setDemande(res.data?.demande || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      router.push("/admin/demandes-proprietaire");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprouver = async () => {
    if (!demande) return;
    setProcessing(true);
    try {
      await demandeProprietaireService.approuver(
        demande._id,
        notesAdmin || undefined
      );
      toast.success("✅ Demande approuvée ! Le client est maintenant propriétaire.");
      router.push("/admin/demandes-proprietaire");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  const handleRefuser = async () => {
    if (!demande) return;
    if (!motifRefus.trim()) {
      toast.error("Le motif du refus est obligatoire");
      return;
    }
    setProcessing(true);
    try {
      await demandeProprietaireService.refuser(
        demande._id,
        motifRefus,
        notesAdmin || undefined
      );
      toast.success("Demande refusée. Le client a été notifié.");
      router.push("/admin/demandes-proprietaire");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!demande) return null;

  const utilisateur =
    typeof demande.utilisateur === "string" ? null : demande.utilisateur;
  const traitePar =
    typeof demande.traitePar === "string" ? null : demande.traitePar;

  return (
    <div className="space-y-6 max-w-6xl">
      <Link
        href="/admin/demandes-proprietaire"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux demandes
      </Link>

      <PageHeader
        title="Demande de propriétaire"
        description={`Soumise le ${new Date(demande.createdAt).toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )}`}
      />

      {/* Statut */}
      <div className="flex items-center gap-3">
        {demande.statut === "en_attente" && (
          <Badge variant="warning" icon={<Clock className="w-4 h-4" />}>
            En attente de validation
          </Badge>
        )}
        {demande.statut === "approuvee" && (
          <Badge variant="success" icon={<CheckCircle2 className="w-4 h-4" />}>
            Approuvée
          </Badge>
        )}
        {demande.statut === "refusee" && (
          <Badge variant="danger" icon={<XCircle className="w-4 h-4" />}>
            Refusée
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Infos hôtel */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Hotel className="w-5 h-5 text-purple-600" />
              Informations de l&apos;hôtel prévu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nom de l&apos;hôtel</p>
                <p className="font-semibold text-slate-900">{demande.nomHotel}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Type</p>
                <Badge variant="purple">{demande.typeHotel}</Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Ville</p>
                <p className="font-medium flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {demande.ville}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Nombre de chambres estimé
                </p>
                <p className="font-medium">
                  {demande.nombreChambres || "Non précisé"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500 mb-1">Adresse complète</p>
                <p className="font-medium">{demande.adresse}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  Téléphone de l&apos;hôtel
                </p>
                <p className="font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {demande.telephoneHotel}
                </p>
              </div>
              {demande.emailHotel && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Email de l&apos;hôtel
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {demande.emailHotel}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Description</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {demande.description}
              </p>
            </div>
          </Card>

          {/* Motivation */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Motivation & Expérience
            </h3>

            <div>
              <p className="text-xs text-slate-500 mb-2">
                Pourquoi rejoindre HotelBenin
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg">
                {demande.motivation}
              </p>
            </div>

            {demande.experience && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">
                  Expérience dans l&apos;hôtellerie
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg">
                  {demande.experience}
                </p>
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Documents fournis
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pièce identité */}
              <div>
                <p className="text-xs text-slate-500 mb-2">
                  Pièce d&apos;identité
                </p>
                <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  {demande.documents.pieceIdentite.match(
                    /\.(jpg|jpeg|png|gif|webp)$/i
                  ) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={demande.documents.pieceIdentite}
                      alt="Pièce d'identité"
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center">
                      <FileText className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="p-2 flex gap-2">
                    <a
                      href={demande.documents.pieceIdentite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        icon={<Download className="w-4 h-4" />}
                      >
                        Voir en grand
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* RCCM */}
              {demande.documents.rccm ? (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Registre du Commerce (RCCM)
                  </p>
                  <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    {demande.documents.rccm.match(
                      /\.(jpg|jpeg|png|gif|webp)$/i
                    ) ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={demande.documents.rccm}
                        alt="RCCM"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="h-48 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-slate-400" />
                      </div>
                    )}
                    <div className="p-2 flex gap-2">
                      <a
                        href={demande.documents.rccm}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          icon={<Download className="w-4 h-4" />}
                        >
                          Voir en grand
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Registre du Commerce (RCCM)
                  </p>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg h-48 flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">
                        Non fourni (facultatif)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Décision (si en attente) */}
          {demande.statut === "en_attente" && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Prendre une décision
              </h3>

              {action === "none" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setAction("approuver")}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Approuver la demande
                  </Button>
                  <Button
                    onClick={() => setAction("refuser")}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Refuser la demande
                  </Button>
                </div>
              )}

              {action === "approuver" && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-900 mb-1">
                          Confirmer l&apos;approbation
                        </p>
                        <p className="text-sm text-green-800">
                          En approuvant cette demande :
                        </p>
                        <ul className="text-xs text-green-700 mt-2 space-y-1 ml-4 list-disc">
                          <li>
                            Le compte de <strong>{utilisateur?.prenom}</strong>{" "}
                            deviendra propriétaire
                          </li>
                          <li>Un email de bienvenue lui sera envoyé</li>
                          <li>Il aura accès à l&apos;espace propriétaire</li>
                          <li>
                            Vous devrez créer son hôtel via{" "}
                            <strong>/admin/hotels/create</strong>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Message pour le nouveau propriétaire (facultatif)"
                    value={notesAdmin}
                    onChange={(e) => setNotesAdmin(e.target.value)}
                    rows={3}
                    placeholder="Ex: Bienvenue ! Nous sommes ravis de vous compter parmi nos partenaires..."
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAction("none");
                        setNotesAdmin("");
                      }}
                      disabled={processing}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleApprouver}
                      disabled={processing}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                      icon={
                        processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )
                      }
                    >
                      {processing
                        ? "Approbation..."
                        : "Confirmer l'approbation"}
                    </Button>
                  </div>
                </div>
              )}

              {action === "refuser" && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">
                          Motif du refus obligatoire
                        </p>
                        <p className="text-sm text-red-800">
                          Le motif sera envoyé par email au demandeur. Soyez
                          respectueux et constructif.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Textarea
                    label="Motif du refus *"
                    value={motifRefus}
                    onChange={(e) => setMotifRefus(e.target.value)}
                    rows={4}
                    required
                    placeholder="Expliquez pourquoi la demande est refusée. Ex: Documents non conformes, informations manquantes..."
                    error={
                      motifRefus.length > 0 && motifRefus.length < 20
                        ? `${20 - motifRefus.length} caractères minimum`
                        : undefined
                    }
                  />

                  <Textarea
                    label="Notes internes (non visibles par le demandeur)"
                    value={notesAdmin}
                    onChange={(e) => setNotesAdmin(e.target.value)}
                    rows={2}
                    placeholder="Notes internes pour votre suivi..."
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAction("none");
                        setMotifRefus("");
                        setNotesAdmin("");
                      }}
                      disabled={processing}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleRefuser}
                      disabled={processing || !motifRefus.trim()}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                      icon={
                        processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )
                      }
                    >
                      {processing ? "Refus en cours..." : "Confirmer le refus"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Historique décision (si traitée) */}
          {demande.statut !== "en_attente" && (
            <Card
              className={`border-l-4 ${
                demande.statut === "approuvee"
                  ? "border-l-green-500 bg-green-50"
                  : "border-l-red-500 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {demande.statut === "approuvee" ? (
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h4
                    className={`font-bold mb-1 ${
                      demande.statut === "approuvee"
                        ? "text-green-900"
                        : "text-red-900"
                    }`}
                  >
                    {demande.statut === "approuvee"
                      ? "Demande approuvée"
                      : "Demande refusée"}
                  </h4>
                  {demande.dateTraitement && (
                    <p className="text-xs text-slate-600 mb-2">
                      Traitée le{" "}
                      {new Date(demande.dateTraitement).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                      {traitePar && (
                        <>
                          {" "}
                          par{" "}
                          <strong>
                            {traitePar.prenom} {traitePar.nom}
                          </strong>
                        </>
                      )}
                    </p>
                  )}

                  {demande.motifRefus && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">
                        Motif du refus
                      </p>
                      <p className="text-sm text-slate-800">
                        {demande.motifRefus}
                      </p>
                    </div>
                  )}

                  {demande.notesAdmin && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">
                        {demande.statut === "approuvee"
                          ? "Message envoyé"
                          : "Notes internes"}
                      </p>
                      <p className="text-sm text-slate-800">
                        {demande.notesAdmin}
                      </p>
                    </div>
                  )}

                  {demande.statut === "approuvee" && utilisateur && (
                    <div className="mt-4">
                      <Link href="/admin/hotels/create">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500"
                          icon={<Hotel className="w-4 h-4" />}
                        >
                          Créer l&apos;hôtel maintenant
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Colonne latérale : Infos client */}
        <div className="space-y-6">
          {utilisateur && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Demandeur
              </h3>

              <div className="flex flex-col items-center text-center mb-4">
                {utilisateur.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={utilisateur.avatar}
                    alt={utilisateur.nom}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-3">
                    {utilisateur.prenom?.[0]}
                    {utilisateur.nom?.[0]}
                  </div>
                )}
                <h4 className="font-bold text-slate-900">
                  {utilisateur.prenom} {utilisateur.nom}
                </h4>
                <p className="text-sm text-slate-500">Client</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium truncate">{utilisateur.email}</p>
                  </div>
                </div>

                {utilisateur.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Téléphone</p>
                      <p className="font-medium">{utilisateur.phone}</p>
                    </div>
                  </div>
                )}

                {utilisateur.createdAt && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Client depuis</p>
                      <p className="font-medium">
                        {new Date(utilisateur.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link href={`/admin/clients/${utilisateur._id}`}>
                  <Button variant="outline" size="sm" fullWidth>
                    Voir le profil complet
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Aide décision */}
          {demande.statut === "en_attente" && (
            <Card className="bg-blue-50 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Aide à la décision
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ Vérifier la pièce d&apos;identité</li>
                <li>✓ Vérifier la cohérence des infos</li>
                <li>✓ Analyser la motivation</li>
                <li>✓ Vérifier l&apos;adresse</li>
                <li>✓ RCCM (bonus) = plus de sérieux</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}