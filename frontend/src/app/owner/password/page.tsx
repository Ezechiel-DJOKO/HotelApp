"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { Lock, Loader2, Save, ShieldCheck, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";

export default function OwnerPasswordPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("Minimum 6 caractères");
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(form.oldPassword, form.newPassword);
      toast.success("Mot de passe modifié !");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Sécurité" description="Modifiez votre mot de passe" />

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full text-purple-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Changer le mot de passe</h3>
            <p className="text-sm text-slate-500">
              Choisissez un mot de passe sécurisé
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              key: "oldPassword",
              label: "Mot de passe actuel",
              show: showOld,
              setShow: setShowOld,
            },
            {
              key: "newPassword",
              label: "Nouveau mot de passe",
              show: showNew,
              setShow: setShowNew,
            },
            {
              key: "confirmPassword",
              label: "Confirmer le nouveau mot de passe",
              show: showConfirm,
              setShow: setShowConfirm,
            },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={field.show ? "text" : "password"}
                  name={field.key}
                  value={form[field.key as keyof typeof form]}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => field.setShow(!field.show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {field.show ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
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
        </form>
      </Card>
    </div>
  );
}