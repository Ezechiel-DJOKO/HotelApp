"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { User, Mail, Phone, Loader2, Save, Camera, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import Input from "@/components/shared/ui/Input";
import Badge from "@/components/shared/ui/Badge";

export default function AdminProfilPage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        prenom: user.prenom || "",
        nom: user.nom || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      updateUser(res.data.utilisateur);
      toast.success("Avatar mis à jour !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Mon Profil"
        description="Gérez vos informations personnelles d'administrateur"
      />

      {/* Card Avatar + Info principale */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            {user.avatar ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={user.avatar}
    alt="Avatar"
    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
  />
) : (
              <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-md">
                {user.prenom?.charAt(0)}
                {user.nom?.charAt(0)}
              </div>
            )}

            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-1 -right-1 bg-red-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-red-700 transition shadow-lg"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-sm text-slate-500 mb-3">{user.email}</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <Badge
                variant="danger"
                icon={<ShieldAlert className="w-3 h-3" />}
              >
                Administrateur
              </Badge>
              <Badge variant="success">Compte actif</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4">
          Informations personnelles
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Nom *"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Email"
            value={user.email}
            disabled
            icon={<Mail className="w-4 h-4" />}
            helperText="L'email ne peut pas être modifié"
          />

          <Input
            label="Téléphone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            icon={<Phone className="w-4 h-4" />}
            placeholder="+229 97 00 00 00"
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              icon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              {loading ? "Sauvegarde..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info sécurité */}
      <Card className="border-l-4 border-l-red-500">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">
              Compte administrateur sensible
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Votre compte a accès à toutes les fonctionnalités de la
              plateforme. Utilisez un mot de passe fort et unique.
            </p>
            <a
              href="/admin/password"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Modifier mon mot de passe →
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}