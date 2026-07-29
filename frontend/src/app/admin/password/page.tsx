"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import {
  Lock,
  Loader2,
  Save,
  ShieldCheck,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";

export default function AdminPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Force du mot de passe
  const getPasswordStrength = () => {
    const p = form.newPassword;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  const strengthColors = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error("Minimum 8 caractères pour un compte admin");
      return;
    }
    if (form.oldPassword === form.newPassword) {
      toast.error("Le nouveau mot de passe doit être différent");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      toast.success("Mot de passe modifié avec succès !");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Sécurité du compte"
        description="Modifiez votre mot de passe administrateur"
      />

      {/* Alerte sécurité */}
      <Card className="border-l-4 border-l-red-500">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900 mb-1">
              Compte à privilèges élevés
            </p>
            <p className="text-slate-600">
              Utilisez un mot de passe unique de <strong>12+ caractères</strong>{" "}
              avec des majuscules, chiffres et symboles.
            </p>
          </div>
        </div>
      </Card>

      {/* Formulaire */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Changer le mot de passe</h3>
            <p className="text-sm text-slate-500">
              Remplissez les champs ci-dessous
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Ancien */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showOld ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOld ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Nouveau */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Indicateur de force */}
            {form.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        i <= strength ? strengthColors[strength] : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Force :{" "}
                  <span className="font-semibold">{strengthLabels[strength]}</span>
                </p>
              </div>
            )}
          </div>

          {/* Confirmer */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {form.confirmPassword &&
              form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  Les mots de passe ne correspondent pas
                </p>
              )}
          </div>

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
              {loading ? "Modification..." : "Changer le mot de passe"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Conseils */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-3">
          💡 Conseils pour un mot de passe fort
        </h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Au moins 12 caractères
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Mélange de majuscules et minuscules
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Au moins un chiffre et un symbole spécial
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 font-bold">✓</span>
            Différent des mots de passe utilisés ailleurs
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">✗</span>
            Évitez les informations personnelles (nom, date de naissance)
          </li>
        </ul>
      </Card>
    </div>
  );
}