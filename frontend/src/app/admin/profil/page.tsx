"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { adminService } from "@/services/admin.service";
import {
  User,
  Mail,
  Phone,
  Loader2,
  Save,
  ShieldAlert,
  Users,
  UserCog,
  Hotel,
  CheckCircle2,
  Edit3,
  Crown,
  Lock,
  Activity,
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

interface PlatformStats {
  totalClients: number;
  totalOwners: number;
  totalHotels: number;
  totalReservations: number;
}

export default function AdminProfilPage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState<PlatformStats | null>(null);
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
    const loadStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats({
          totalClients: res.data?.totalClients || 0,
          totalOwners: res.data?.totalOwners || 0,
          totalHotels: res.data?.totalHotels || 0,
          totalReservations: res.data?.totalReservations || 0,
        });
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
        description="Gérez votre compte administrateur"
      />

      {/* Bannière + Avatar */}
      <Card padding="none" className="overflow-hidden">
        <div className="h-32 sm:h-40 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Motifs décoratifs */}
          <div className="absolute top-4 right-4 opacity-20">
            <ShieldAlert className="w-16 h-16 text-white" />
          </div>
          <div className="absolute bottom-4 left-4 opacity-20">
            <Crown className="w-12 h-12 text-white" />
          </div>
        </div>

        <div className="px-6 pb-6 -mt-16 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            <AvatarUpload
              currentAvatar={user.avatar}
              userName={`${user.prenom} ${user.nom}`}
              onUpload={handleAvatarUpload}
              size="xl"
              color="red"
            />

            <div className="flex-1 text-center sm:text-left mt-2 sm:mb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.prenom} {user.nom}
                </h2>
                {user.isVerified && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mb-2">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge
                  variant="danger"
                  icon={<ShieldAlert className="w-3 h-3" />}
                >
                  Administrateur
                </Badge>
                <Badge variant="warning" icon={<Crown className="w-3 h-3" />}>
                  Super Admin
                </Badge>
                <Badge variant="success">Membre depuis {memberSince}</Badge>
              </div>
            </div>

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

      {/* Avertissement Zone Admin */}
      <Card className="bg-gradient-to-br from-red-500 to-orange-500 border-0 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">🛡️ Zone Administrateur</h3>
            <p className="text-sm text-white/90">
              Vous avez un accès complet à la plateforme HotelBenin. Toutes vos
              actions sont **enregistrées et traçables**. Faites preuve de
              professionnalisme et de discrétion.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Plateforme */}
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-red-600" />
          Vue d&apos;ensemble de la plateforme
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Clients"
            value={stats?.totalClients || 0}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <StatCard
            label="Propriétaires"
            value={stats?.totalOwners || 0}
            icon={<UserCog className="w-5 h-5" />}
            color="purple"
          />
          <StatCard
            label="Hôtels"
            value={stats?.totalHotels || 0}
            icon={<Hotel className="w-5 h-5" />}
            color="green"
          />
          <StatCard
            label="Réservations"
            value={stats?.totalReservations || 0}
            icon={<Activity className="w-5 h-5" />}
            color="yellow"
          />
        </div>
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
              Email administrateur
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-medium flex-1">
                {user.email}
              </span>
              <Badge
                variant="danger"
                icon={<Lock className="w-3 h-3" />}
              >
                Protégé
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              L&apos;email admin ne peut pas être modifié pour des raisons de
              sécurité
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
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
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

      {/* Sécurité */}
      <Card className="border-l-4 border-l-red-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">
              Sécurité renforcée recommandée
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              En tant qu&apos;administrateur, votre compte a un accès total. Il
              est fortement recommandé d&apos;utiliser un mot de passe fort et
              unique.
            </p>
            <Link href="/admin/password">
              <button className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Modifier mon mot de passe
              </button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin">
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">📊</div>
              <div>
                <p className="font-medium text-slate-900">Dashboard</p>
                <p className="text-xs text-slate-500">Vue d&apos;ensemble</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/hotels">
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">🏨</div>
              <div>
                <p className="font-medium text-slate-900">Hôtels</p>
                <p className="text-xs text-slate-500">Gérer</p>
              </div>
            </div>
          </Link>

          <Link href="/admin/reversements">
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">💰</div>
              <div>
                <p className="font-medium text-slate-900">Reversements</p>
                <p className="text-xs text-slate-500">Payer les hôtels</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}