"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { Hotel, Loader2, MailCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyOTPPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("otp_email");
    if (!savedEmail) {
      router.push("/auth/register");
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  const handleChange = (index: number, value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Entrez les 6 chiffres");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.verifyOTP(email, otpCode);
      const { token, utilisateur } = res.data;
      setAuth(utilisateur, token);
      sessionStorage.removeItem("otp_email");
      toast.success("Compte vérifié !");

      // ✅ REDIRECTION SELON LE RÔLE
      if (utilisateur.role === "admin") router.push("/admin");
      else if (utilisateur.role === "owner") router.push("/owner");
      else router.push("/client");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Code invalide");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.resendOTP(email);
      toast.success("Nouveau code envoyé !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Hotel className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Hotel<span className="text-blue-600">Benin</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Vérification
          </h1>
          <p className="text-sm text-gray-600 text-center mb-6">
            Nous avons envoyé un code à
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Vérification...
                </>
              ) : (
                "Vérifier mon compte"
              )}
            </button>
          </form>

          <div className="text-center mt-6 space-y-2">
            <p className="text-sm text-gray-600">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-blue-600 font-medium hover:underline disabled:opacity-50 text-sm"
            >
              {resending ? "Envoi..." : "Renvoyer le code"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}