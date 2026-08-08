"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { reservationService } from "@/services/reservation.service";
import {
  User,
  Mail,
  Phone,
  Loader2,
  Save,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Edit3,
  Compass,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Badge from "@/components/shared/ui/Badge";
import AvatarUpload from "@/components/shared/ui/AvatarUpload";
import StatCard from "@/components/shared/ui/StatCard";

export default function ClientProfilPage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [totalReservations, setTotalReservations] = useState(0);
  const [form, setForm] = useState({ prenom: "", nom: "", phone: "" });

  useEffect(() => {
    if (user) {
      setForm({
        prenom: user.prenom || "",
        nom: user.nom || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    // Charger le nombre de réservations
    const loadStats = async () => {
      try {
        const res = await reservationService.getMesReservations();
        setTotalReservations(res.data?.reservations?.length || 0);
      } catch (error) {
        console.error("Erreur stats:", error);
      }
    };
    loadStats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userService.updateProfil(form);
      updateUser(res.data.utilisateur);
      toast.success("Profil mis à jour !");
      setEditMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const res = await userService.uploadAvatar(file);
    updateUser(res.data.utilisateur);
  };

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : "Récemment";

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Mon Profil"
        description="Gérez vos informations personnelles"
      />

      {/* Bannière + Avatar */}
      <Card padding="none" className="overflow-hidden">
        {/* Bannière colorée */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Motifs décoratifs */}
          <div className="absolute top-4 right-4 opacity-20">
            <Compass className="w-16 h-16 text-white" />
          </div>
        </div>

        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <AvatarUpload
              currentAvatar={user.avatar}
              userName={`${user.prenom} ${user.nom}`}
              onUpload={handleAvatarUpload}
              size="xl"
              color="blue"
            />

            {/* Infos + Badge */}
            <div className="flex-1 text-center sm:text-left mt-2 sm:mb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.prenom} {user.nom}
                </h2>
                {user.isVerified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-2">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge variant="primary" icon={<Compass className="w-3 h-3" />}>
                  Voyageur
                </Badge>
                <Badge variant="success">Membre depuis {memberSince}</Badge>
              </div>
            </div>

            {/* Bouton edit */}
            <div className="flex-shrink-0">
              {!editMode ? (
                <Button
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  Modifier
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setEditMode(false)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Annuler
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Réservations"
          value={totalReservations}
          icon={<Calendar className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Voyages effectués"
          value={0}
          icon={<MapPin className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Statut"
          value={totalReservations > 5 ? "Ambassadeur" : "Nouveau"}
          icon={<Award className="w-5 h-5" />}
          color="yellow"
        />
      </div>

      {/* Formulaire */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Informations personnelles
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Prénom
              </label>
              {editMode ? (
                <Input
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                  icon={<User className="w-4 h-4" />}
                />
              ) : (
                <p className="px-3 py-2.5 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {user.prenom}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nom
              </label>
              {editMode ? (
                <Input
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p className="px-3 py-2.5 bg-slate-50 rounded-lg text-slate-900 font-medium">
                  {user.nom}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium flex-1">
                {user.email}
              </span>
              <Badge variant="success" icon={<CheckCircle2 className="w-3 h-3" />}>
                Vérifié
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Téléphone
            </label>
            {editMode ? (
              <Input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                icon={<Phone className="w-4 h-4" />}
                placeholder="+229 97 00 00 00"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 font-medium">
                  {user.phone || "Non renseigné"}
                </span>
              </div>
            )}
          </div>

          {editMode && (
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  setForm({
                    prenom: user.prenom,
                    nom: user.nom,
                    phone: user.phone || "",
                  });
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                icon={
                  loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )
                }
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Section : Devenir propriétaire */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              🏨 Devenez propriétaire d&apos;hôtel !
            </h3>
            <p className="text-sm text-white/90 mb-3">
              Vous possédez un hôtel ou une auberge ? Rejoignez notre plateforme
              et commencez à recevoir des réservations dès maintenant.
            </p>
            <Link href="/client/devenir-proprietaire">
              <button className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg text-sm font-semibold transition">
                Faire une demande
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/client/password">
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">🔐</div>
              <div>
                <p className="font-medium text-slate-900">Sécurité</p>
                <p className="text-xs text-slate-500">
                  Modifier votre mot de passe
                </p>
              </div>
            </div>
          </Link>

          <Link href="/client">
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">📋</div>
              <div>
                <p className="font-medium text-slate-900">
                  Mes réservations
                </p>
                <p className="text-xs text-slate-500">Voir mes séjours</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}