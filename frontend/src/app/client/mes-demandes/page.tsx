"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  demandeProprietaireService,
  DemandeProprietaire,
} from "@/services/demandeProprietaire.service";
import {
  Hotel,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ArrowLeft,
  PlusCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import EmptyState from "@/components/shared/ui/EmptyState";

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<DemandeProprietaire[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await demandeProprietaireService.getMesDemandes();
      setDemandes(res.data?.demandes || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader fullPage />;

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/client/profil"
        className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <PageHeader
        title="Mes demandes de propriétaire"
        description="Suivez l'avancement de vos demandes pour devenir propriétaire"
        action={
          <Link href="/client/devenir-proprietaire">
            <Button
              icon={<PlusCircle className="w-4 h-4" />}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Nouvelle demande
            </Button>
          </Link>
        }
      />

      {demandes.length === 0 ? (
        <EmptyState
          icon={<Hotel className="w-8 h-8" />}
          title="Aucune demande"
          description="Vous n'avez pas encore fait de demande pour devenir propriétaire d'hôtel."
          action={
            <Link href="/client/devenir-proprietaire">
              <Button
                icon={<PlusCircle className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                Faire une demande
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {demandes.map((demande) => {
            const traitePar =
              typeof demande.traitePar === "string"
                ? null
                : demande.traitePar;

            return (
              <Card key={demande._id} hover>
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icône statut */}
                  <div className="flex-shrink-0">
                    {demande.statut === "en_attente" && (
                      <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-7 h-7 text-yellow-600" />
                      </div>
                    )}
                    {demande.statut === "approuvee" && (
                      <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7 text-green-600" />
                      </div>
                    )}
                    {demande.statut === "refusee" && (
                      <div className="w-14 h-14 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-red-600" />
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    {/* Statut + Type */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {demande.statut === "en_attente" && (
                        <Badge
                          variant="warning"
                          icon={<Clock className="w-3 h-3" />}
                        >
                          En attente de validation
                        </Badge>
                      )}
                      {demande.statut === "approuvee" && (
                        <Badge
                          variant="success"
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Approuvée
                        </Badge>
                      )}
                      {demande.statut === "refusee" && (
                        <Badge
                          variant="danger"
                          icon={<XCircle className="w-3 h-3" />}
                        >
                          Refusée
                        </Badge>
                      )}
                      <Badge variant="default">{demande.typeHotel}</Badge>
                    </div>

                    {/* Nom hôtel */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                      {demande.nomHotel}
                    </h3>

                    {/* Infos */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {demande.ville}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(demande.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    {/* Motif de refus */}
                    {demande.statut === "refusee" && demande.motifRefus && (
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg mb-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-1">
                              Motif du refus
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-400">
                              {demande.motifRefus}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message de l'admin si approuvée */}
                    {demande.statut === "approuvee" && demande.notesAdmin && (
                      <div className="p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg mb-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-1">
                              Message de l&apos;administrateur
                            </p>
                            <p className="text-sm text-green-800 dark:text-green-400">
                              {demande.notesAdmin}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date de traitement */}
                    {demande.dateTraitement && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Traitée le{" "}
                        {new Date(demande.dateTraitement).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
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

                    {/* Actions selon statut */}
                    {demande.statut === "en_attente" && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-lg">
                        <p className="text-xs text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Notre équipe examine votre demande. Vous serez
                          notifié(e) par email et notification.
                        </p>
                      </div>
                    )}

                    {demande.statut === "approuvee" && (
                      <div className="mt-3">
                        <Link href="/owner">
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            icon={<Hotel className="w-4 h-4" />}
                          >
                            Accéder à mon espace propriétaire
                          </Button>
                        </Link>
                      </div>
                    )}

                    {demande.statut === "refusee" && (
                      <div className="mt-3">
                        <Link href="/client/devenir-proprietaire">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<PlusCircle className="w-4 h-4" />}
                          >
                            Soumettre une nouvelle demande
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Documents */}
                  <div className="flex-shrink-0 lg:text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1 lg:justify-end">
                      <FileText className="w-3 h-3" />
                      Documents
                    </p>
                    <div className="flex lg:flex-col gap-2">
                      <a
                        href={demande.documents.pieceIdentite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg transition text-slate-700 dark:text-slate-300"
                      >
                        📄 Pièce ID
                      </a>
                      {demande.documents.rccm && (
                        <a
                          href={demande.documents.rccm}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg transition text-slate-700 dark:text-slate-300"
                        >
                          📄 RCCM
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-500/10 dark:to-pink-500/10 border-purple-200 dark:border-purple-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg flex-shrink-0">
            <Hotel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              Comment ça marche ?
            </p>
            <ul className="text-xs text-slate-700 dark:text-slate-400 space-y-1">
              <li>1. Vous soumettez votre demande avec les documents requis</li>
              <li>2. Notre équipe examine votre dossier sous 24-48h</li>
              <li>
                3. Si approuvée, votre compte devient &quot;Propriétaire&quot;
              </li>
              <li>4. L&apos;admin crée votre hôtel avec vos informations</li>
              <li>5. Vous ajoutez vos chambres et commencez à recevoir des réservations !</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}