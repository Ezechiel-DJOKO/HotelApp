"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  Hotel,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";

import PasswordInput from "@/components/shared/ui/PasswordInput";
import PasswordStrength, {
  passwordRequirements,
} from "@/components/shared/ui/PasswordStrength";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("reset_email");
    if (!savedEmail) {
      router.push("/auth/forgot-password");
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Nouveau code envoyé !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setResending(false);
    }
  };

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsDontMatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;
  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(newPassword)
  );
  const otpComplete = otp.every((d) => d !== "");
  const canSubmit = otpComplete && allRequirementsMet && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Entrez les 6 chiffres du code");
      return;
    }
    if (!allRequirementsMet) {
      toast.error("Le mot de passe ne respecte pas tous les critères");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(email, otpCode, newPassword);
      sessionStorage.removeItem("reset_email");
      setSuccess(true);

      toast.success("🎉 Mot de passe modifié !");

      // Redirection vers login après 3 secondes
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Code invalide ou expiré"
      );
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
          {/* Retour */}
          {!success && (
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Link>
          )}

          {!success ? (
            <>
              {/* Icône */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Réinitialiser le mot de passe
              </h1>
              <p className="text-sm text-gray-600 text-center mb-2">
                Code envoyé à
              </p>
              <p className="text-sm text-gray-900 text-center font-semibold mb-6 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {email}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Code OTP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                    Code de vérification à 6 chiffres
                  </label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          inputsRef.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    ))}
                  </div>

                  {/* Renvoyer code */}
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Renvoyer le code
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <PasswordInput
                    label="Nouveau mot de passe"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Choisissez un mot de passe fort"
                  />
                  <PasswordStrength password={newPassword} />
                </div>

                {/* Confirmer */}
                <PasswordInput
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Retapez le mot de passe"
                  error={
                    passwordsDontMatch
                      ? "Les mots de passe ne correspondent pas"
                      : undefined
                  }
                />

                {passwordsMatch && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Les mots de passe correspondent</span>
                  </div>
                )}

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Réinitialisation...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Réinitialiser mon mot de passe
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Écran de succès */
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in-50 duration-500">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Mot de passe modifié ! 🎉
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez
                être redirigé(e) vers la page de connexion.
              </p>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                <p className="text-xs text-green-800">
                  <strong>✅ Vous pouvez maintenant vous connecter</strong>
                  <br />
                  Utilisez votre email et votre nouveau mot de passe.
                </p>
              </div>

              <Link href="/auth/login">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2.5 rounded-lg font-medium transition inline-flex items-center justify-center gap-2">
                  Aller à la connexion →
                </button>
              </Link>

              <p className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Redirection automatique dans quelques secondes...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}