"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  Hotel,
  Mail,
  Loader2,
  ArrowLeft,
  KeyRound,
  Info,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error("Format d'email invalide");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Code envoyé ! Vérifiez votre email.");
      sessionStorage.setItem("reset_email", email);
      setSent(true);

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push("/auth/reset-password");
      }, 2000);
    } catch (error) {
      // Le backend renvoie toujours succès pour la sécurité
      // (ne pas révéler si l'email existe ou non)
      toast.success("Si cet email existe, un code a été envoyé.");
      sessionStorage.setItem("reset_email", email);
      setSent(true);

      setTimeout(() => {
        router.push("/auth/reset-password");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Hotel<span className="text-blue-600">Benin</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Retour login */}
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          {!sent ? (
            <>
              {/* Icône */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <KeyRound className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Mot de passe oublié ?
              </h1>
              <p className="text-sm text-gray-600 text-center mb-6">
                Pas de panique ! Entrez votre email et nous vous enverrons un
                code de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="votre@email.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Nous enverrons un code à cet email
                  </p>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800">
                    Pour votre sécurité, nous vous enverrons un code à 6 chiffres
                    valable pendant <strong>10 minutes</strong>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Envoyer le code
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Vous vous souvenez ?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </>
          ) : (
            /* État après envoi */
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Email envoyé ! ✉️
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                Si l&apos;email <strong>{email}</strong> existe dans notre base,
                vous recevrez un code de réinitialisation dans les prochaines
                secondes.
              </p>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-xs text-blue-800">
                  <strong>📧 Vérifiez votre boîte mail</strong>
                  <br />
                  N&apos;oubliez pas de regarder dans vos spams si vous ne
                  recevez rien.
                </p>
              </div>

              <p className="text-xs text-slate-500">
                Redirection en cours...
              </p>
              <Loader2 className="w-4 h-4 text-slate-400 animate-spin mx-auto mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}