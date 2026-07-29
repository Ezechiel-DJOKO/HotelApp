"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminService } from "@/services/admin.service";
import { Hotel } from "@/types";
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Hotel as HotelIcon,
  ShieldCheck,
  Power,
  PowerOff,
  Edit,
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Badge from "@/components/shared/ui/Badge";
import Loader from "@/components/shared/ui/Loader";
import ImageLightbox from "@/components/shared/ui/ImageLightbox";

interface HotelWithOwner extends Hotel {
  proprietaire?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    phone?: string;
  };
}

export default function AdminHotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [hotel, setHotel] = useState<HotelWithOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await adminService.getAllHotels();
      const found = (res.data?.hotels as HotelWithOwner[])?.find(
        (h) => h._id === params.id
      );
      if (!found) {
        toast.error("Hôtel introuvable");
        router.push("/admin/hotels");
        return;
      }
      setHotel(found);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVerify = async () => {
    if (!hotel) return;
    try {
      await adminService.verifyHotel(hotel._id);
      toast.success("Hôtel vérifié");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  const handleToggleActive = async () => {
    if (!hotel) return;
    try {
      await adminService.toggleHotelActive(hotel._id);
      toast.success("Statut modifié");
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    }
  };

  if (loading) return <Loader fullPage />;
  if (!hotel) return null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/hotels"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la liste
      </Link>

      <PageHeader
        title={hotel.nom}
        description={`${hotel.type} • ${hotel.ville}`}
        action={
          <div className="flex flex-wrap gap-2">
            {!hotel.estVerifie && (
              <Button
                variant="success"
                onClick={handleVerify}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Vérifier
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleToggleActive}
              icon={
                hotel.estActif ? (
                  <PowerOff className="w-4 h-4" />
                ) : (
                  <Power className="w-4 h-4" />
                )
              }
            >
              {hotel.estActif ? "Désactiver" : "Activer"}
            </Button>
            <Link href={`/admin/hotels/${hotel._id}/edit`}>
              <Button icon={<Edit className="w-4 h-4" />}>Modifier</Button>
            </Link>
          </div>
        }
      />

      {/* Statuts */}
      <div className="flex flex-wrap gap-2">
        {hotel.estVerifie ? (
          <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
            Vérifié
          </Badge>
        ) : (
          <Badge variant="warning">Non vérifié</Badge>
        )}
        {hotel.estActif ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
            Inactif
          </Badge>
        )}
        <Badge variant="default">{hotel.type}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {hotel.images && hotel.images.length > 0 ? (
  <div>
    {hotel.images.length === 1 ? (
      // ============ 1 SEULE IMAGE ============
      <button
        onClick={() => {
          setLightboxIndex(0);
          setLightboxOpen(true);
        }}
        className="w-full group"
      >
        <Card
          padding="none"
          className="overflow-hidden aspect-video bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hotel.images[0]}
            alt={hotel.nom}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Card>
      </button>
    ) : (
      // ============ PLUSIEURS IMAGES : MOSAÏQUE ============
      <div className="grid grid-cols-4 gap-2 h-80 sm:h-96">
        {/* Grande image à gauche */}
        <button
          onClick={() => {
            setLightboxIndex(0);
            setLightboxOpen(true);
          }}
          className="col-span-4 sm:col-span-2 row-span-2 group"
        >
          <Card
            padding="none"
            className="overflow-hidden h-full bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hotel.images[0]}
              alt={hotel.nom}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </Card>
        </button>

        {/* 4 miniatures à droite (visibles sur sm+) */}
        {hotel.images.slice(1, 5).map((img, i) => {
          const isLast = i === 3 && hotel.images.length > 5;
          return (
            <button
              key={i}
              onClick={() => {
                setLightboxIndex(i + 1);
                setLightboxOpen(true);
              }}
              className="hidden sm:block col-span-1 row-span-1 group"
            >
              <Card
                padding="none"
                className="overflow-hidden h-full bg-slate-100 relative cursor-pointer hover:shadow-xl transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${hotel.nom} - photo ${i + 2}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay "+ X photos" sur la dernière miniature */}
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <span className="text-2xl font-bold">
                      +{hotel.images.length - 5}
                    </span>
                    <span className="text-xs font-medium">photos</span>
                  </div>
                )}
              </Card>
            </button>
          );
        })}
      </div>
    )}

    {/* Bouton "Voir toutes les photos" (mobile + desktop) */}
    <button
      onClick={() => {
        setLightboxIndex(0);
        setLightboxOpen(true);
      }}
      className="mt-3 w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition inline-flex items-center gap-2 justify-center"
    >
      🖼️ Voir toutes les photos ({hotel.images.length})
    </button>
  </div>
) : (
  <Card padding="lg" className="text-center">
    <HotelIcon className="w-16 h-16 text-slate-300 mx-auto mb-2" />
    <p className="text-slate-500">Aucune image</p>
  </Card>
)}
          

          {/* Description */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-3">Description</h3>
            <p className="text-slate-700 whitespace-pre-line">
              {hotel.description}
            </p>
          </Card>

          {/* Infos */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Adresse</p>
                <p className="text-sm font-medium flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{hotel.adresse}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Étoiles</p>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {Array.from({ length: hotel.etoiles }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
              {hotel.telephone && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Téléphone</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {hotel.telephone}
                  </p>
                </div>
              )}
              {hotel.email && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {hotel.email}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 mb-1">Prix minimum</p>
                <p className="text-sm font-medium">
                  {hotel.fourchettePrix?.min?.toLocaleString("fr-FR") || 0} XOF
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Prix maximum</p>
                <p className="text-sm font-medium">
                  {hotel.fourchettePrix?.max?.toLocaleString("fr-FR") || 0} XOF
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Owner */}
          {hotel.proprietaire && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Propriétaire
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {hotel.proprietaire.prenom?.charAt(0)}
                  {hotel.proprietaire.nom?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {hotel.proprietaire.prenom} {hotel.proprietaire.nom}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {hotel.proprietaire.email}
                  </p>
                </div>
              </div>
              {hotel.proprietaire.phone && (
                <p className="text-sm text-slate-600 flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4" />
                  {hotel.proprietaire.phone}
                </p>
              )}
              <Link href={`/admin/owners/${hotel.proprietaire._id}`}>
                <Button variant="outline" size="sm" fullWidth>
                  Voir le profil
                </Button>
              </Link>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Note moyenne</span>
                <span className="font-semibold">
                  ⭐ {hotel.note?.toFixed(1) || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Nombre d&apos;avis</span>
                <span className="font-semibold">{hotel.nombreAvis || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Lightbox pour voir les images en grand */}
{hotel.images && hotel.images.length > 0 && (
  <ImageLightbox
    images={hotel.images}
    initialIndex={lightboxIndex}
    isOpen={lightboxOpen}
    onClose={() => setLightboxOpen(false)}
    alt={hotel.nom}
  />
)}
    </div>
  );
}