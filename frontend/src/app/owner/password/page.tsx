"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import {
  ShieldCheck,
  Loader2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";
import PasswordInput from "@/components/shared/ui/PasswordInput";
import PasswordStrength, {
  passwordRequirements,
  getPasswordStrength,
} from "@/components/shared/ui/PasswordStrength";

export default function OwnerPasswordPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const passwordsDontMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;
  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(form.newPassword)
  );
  const canSubmit =
    form.oldPassword.length > 0 &&
    allRequirementsMet &&
    passwordsMatch &&
    form.oldPassword !== form.newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!allRequirementsMet) {
      toast.error("Le mot de passe ne respecte pas tous les critères");
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error("Le nouveau mot de passe doit être différent de l'ancien");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      toast.success("🎉 Mot de passe modifié ! Reconnectez-vous.");

      setTimeout(() => {
        logout();
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/owner/profil"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <PageHeader
        title="Sécurité du compte"
        description="Modifiez votre mot de passe pour protéger votre activité professionnelle"
      />

      {/* Bannière sécurité */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              🔐 Protégez votre business
            </h3>
            <p className="text-sm text-white/90">
              En tant que propriétaire, votre compte gère les réservations et
              les revenus. Un mot de passe fort est essentiel pour éviter tout
              accès non autorisé.
            </p>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full text-purple-600">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Changer le mot de passe</h3>
            <p className="text-sm text-slate-500">
              Complétez les 3 champs ci-dessous
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            label="Mot de passe actuel"
            name="oldPassword"
            value={form.oldPassword}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Entrez votre mot de passe actuel"
          />

          <div>
            <PasswordInput
              label="Nouveau mot de passe"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Choisissez un mot de passe fort"
              error={
                form.oldPassword &&
                form.newPassword &&
                form.oldPassword === form.newPassword
                  ? "Le nouveau mot de passe doit être différent de l'ancien"
                  : undefined
              }
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Retapez le nouveau mot de passe"
            error={passwordsDontMatch ? "Les mots de passe ne correspondent pas" : undefined}
          />

          {passwordsMatch && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Les mots de passe correspondent</span>
            </div>
          )}

          {canSubmit && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold mb-1">Reconnexion requise</p>
                <p>
                  Après le changement, vous serez déconnecté(e) pour vous
                  reconnecter avec votre nouveau mot de passe.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !canSubmit}
            fullWidth
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            icon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {loading ? "Modification en cours..." : "Modifier mon mot de passe"}
          </Button>
        </form>
      </Card>

      {/* Conseils */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-600" />
          Conseils pour un mot de passe sécurisé
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "✅", text: "Utilisez au moins 12 caractères", type: "good" },
            { icon: "✅", text: "Mélangez lettres, chiffres et symboles", type: "good" },
            { icon: "✅", text: "Utilisez une phrase mémorable", type: "good" },
            { icon: "✅", text: "Changez régulièrement", type: "good" },
            { icon: "❌", text: "N'utilisez pas de dates personnelles", type: "bad" },
            { icon: "❌", text: "Ne réutilisez pas d'autres mots de passe", type: "bad" },
            { icon: "❌", text: "Ne le partagez avec personne", type: "bad" },
            { icon: "❌", text: "Évitez les mots du dictionnaire", type: "bad" },
          ].map((tip, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                tip.type === "good"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <span className="text-base flex-shrink-0">{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}