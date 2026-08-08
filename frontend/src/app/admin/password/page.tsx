"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import {
  ShieldAlert,
  Loader2,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  Lock,
  Crown,
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

export default function AdminPasswordPage() {
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

  const strength = getPasswordStrength(form.newPassword);
  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const passwordsDontMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;
  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(form.newPassword)
  );
  // Pour l'admin : exiger un score minimum de 4 (Fort)
  const isStrongEnough = strength.score >= 4;
  const canSubmit =
    form.oldPassword.length > 0 &&
    allRequirementsMet &&
    isStrongEnough &&
    passwordsMatch &&
    form.oldPassword !== form.newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStrongEnough) {
      toast.error(
        "En tant qu'admin, votre mot de passe doit être 'Fort' ou 'Excellent'"
      );
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error("Le nouveau mot de passe doit être différent");
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
        href="/admin/profil"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au profil
      </Link>

      <PageHeader
        title="Sécurité du compte administrateur"
        description="Votre mot de passe protège tous les accès de la plateforme"
      />

      {/* Bannière sécurité RENFORCÉE */}
      <Card className="bg-gradient-to-br from-red-500 to-orange-500 border-0 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl flex-shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
              🛡️ Compte à privilèges élevés
            </h3>
            <p className="text-sm text-white/90">
              En tant qu&apos;administrateur, votre mot de passe protège l&apos;accès
              à toutes les données de la plateforme. Il doit être{" "}
              <strong>très fort et unique</strong>. Un score de sécurité de
              &quot;Fort&quot; ou plus est obligatoire.
            </p>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-full text-red-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">
              Changer le mot de passe administrateur
            </h3>
            <p className="text-sm text-slate-500">
              Sécurité renforcée requise
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
            placeholder="Entrez votre mot de passe admin actuel"
          />

          <div>
            <PasswordInput
              label="Nouveau mot de passe (Fort minimum requis)"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              placeholder="Minimum 12 caractères recommandé"
              error={
                form.oldPassword &&
                form.newPassword &&
                form.oldPassword === form.newPassword
                  ? "Le nouveau mot de passe doit être différent"
                  : undefined
              }
            />
            <PasswordStrength password={form.newPassword} />

            {form.newPassword && !isStrongEnough && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-red-800">
                  <p className="font-semibold mb-1">
                    Niveau de sécurité insuffisant
                  </p>
                  <p>
                    Un compte admin nécessite un mot de passe de niveau{" "}
                    <strong>&quot;Fort&quot;</strong> ou{" "}
                    <strong>&quot;Excellent&quot;</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Retapez le nouveau mot de passe"
            error={
              passwordsDontMatch ? "Les mots de passe ne correspondent pas" : undefined
            }
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
                <p className="font-semibold mb-1">Reconnexion obligatoire</p>
                <p>
                  Pour des raisons de sécurité, vous serez déconnecté(e) et
                  devrez vous reconnecter avec votre nouveau mot de passe.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !canSubmit}
            fullWidth
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            icon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {loading
              ? "Modification en cours..."
              : "Modifier mon mot de passe administrateur"}
          </Button>
        </form>
      </Card>

      {/* Avertissements sécurité renforcée */}
      <Card className="border-l-4 border-l-red-500">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          Règles de sécurité obligatoires
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: "✅", text: "Minimum 12 caractères", type: "good" },
            { icon: "✅", text: "Score de sécurité 'Fort' ou +", type: "good" },
            { icon: "✅", text: "Combinez majuscules, chiffres et symboles", type: "good" },
            { icon: "✅", text: "Changez tous les 3 mois", type: "good" },
            { icon: "❌", text: "JAMAIS de mot de passe personnel", type: "bad" },
            { icon: "❌", text: "JAMAIS partagé avec quelqu'un", type: "bad" },
            { icon: "❌", text: "JAMAIS écrit sur papier", type: "bad" },
            { icon: "❌", text: "JAMAIS réutilisé ailleurs", type: "bad" },
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

      {/* Recommandation gestionnaire */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm mb-1">
              💡 Utilisez un gestionnaire de mots de passe
            </p>
            <p className="text-xs text-slate-600">
              Pour un compte admin, nous recommandons fortement l&apos;utilisation
              d&apos;un gestionnaire de mots de passe comme{" "}
              <strong>Bitwarden</strong>, <strong>1Password</strong> ou{" "}
              <strong>LastPass</strong> pour générer et stocker de manière
              sécurisée votre mot de passe unique et complexe.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}