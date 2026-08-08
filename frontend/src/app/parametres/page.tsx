"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore, Theme } from "@/store/themeStore";
import { useLanguageStore, Language } from "@/store/languageStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { userService } from "@/services/user.service";
import {
  Settings,
  Bell,
  Globe,
  Lock,
  Palette,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Loader2,
  Moon,
  Sun,
  Mail,
  Smartphone,
  Shield,
  Eye,
  Monitor,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

import PageHeader from "@/components/shared/ui/PageHeader";
import Card from "@/components/shared/ui/Card";
import Button from "@/components/shared/ui/Button";

export default function ParametresPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { preferences, toggleNotification, toggleConfidentialite } =
    usePreferencesStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(
      `Thème ${
        newTheme === "light"
          ? "clair"
          : newTheme === "dark"
          ? "sombre"
          : "automatique"
      } activé`
    );
  };

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    toast.loading("Changement de langue...", { id: "lang" });
    setLanguage(newLang);
    // Le setLanguage recharge la page
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== "SUPPRIMER") {
      toast.error("Vous devez taper SUPPRIMER pour confirmer");
      return;
    }

    setDeleting(true);
    try {
      await userService.supprimerCompte();
      toast.success("Compte supprimé. À bientôt !");
      logout();
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
      setDeleting(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin";
    if (user.role === "owner") return "/owner";
    return "/client";
  };

  const getPasswordLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/password";
    if (user.role === "owner") return "/owner/password";
    return "/client/password";
  };

  const getProfilLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/profil";
    if (user.role === "owner") return "/owner/profil";
    return "/client/profil";
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href={getDashboardLink()}
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au dashboard
      </Link>

      <PageHeader
        title="Paramètres"
        description="Personnalisez votre expérience HotelBenin"
      />

      {/* ============ THÈME ============ */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-600" />
          Apparence
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          Choisissez votre thème préféré. Le mode automatique s&apos;adapte à
          votre système.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "light" as Theme,
              label: "Clair",
              icon: <Sun className="w-6 h-6" />,
              desc: "Toujours clair",
            },
            {
              value: "dark" as Theme,
              label: "Sombre",
              icon: <Moon className="w-6 h-6" />,
              desc: "Toujours sombre",
            },
            {
              value: "auto" as Theme,
              label: "Automatique",
              icon: <Monitor className="w-6 h-6" />,
              desc: "Suit le système",
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={`relative p-4 border-2 rounded-lg text-center transition ${
                theme === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {theme === option.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`inline-flex p-3 rounded-lg mb-2 ${
                  theme === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {option.icon}
              </div>
              <p className="font-medium text-sm text-slate-900">
                {option.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>💡 Mode actuel :</strong>{" "}
            {theme === "light"
              ? "Clair"
              : theme === "dark"
              ? "Sombre"
              : "Automatique (suit votre système)"}
          </p>
        </div>
      </Card>

      {/* ============ LANGUE ============ */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Langue
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          Sélectionnez votre langue préférée. La page se rechargera après le
          changement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: "fr" as Language, label: "Français", flag: "🇫🇷" },
            { value: "en" as Language, label: "English", flag: "🇬🇧" },
            { value: "es" as Language, label: "Español", flag: "🇪🇸" },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`relative p-4 border-2 rounded-lg text-center transition ${
                language === lang.value
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {language === lang.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-4xl mb-2">{lang.flag}</div>
              <p className="font-medium text-sm text-slate-900">{lang.label}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ============ NOTIFICATIONS ============ */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notifications
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          Choisissez comment et quand vous souhaitez être notifié.
        </p>

        <div className="space-y-3">
          {[
            {
              key: "email" as const,
              icon: <Mail className="w-5 h-5" />,
              label: "Notifications par email",
              desc: "Recevoir des emails pour les événements importants",
            },
            {
              key: "push" as const,
              icon: <Smartphone className="w-5 h-5" />,
              label: "Notifications push",
              desc: "Notifications instantanées dans le navigateur",
            },
            {
              key: "reservations" as const,
              icon: <Bell className="w-5 h-5" />,
              label: "Mises à jour de réservations",
              desc: "Confirmations, changements, annulations",
            },
            {
              key: "promotions" as const,
              icon: <Palette className="w-5 h-5" />,
              label: "Promotions et offres",
              desc: "Offres spéciales et réductions",
            },
            {
              key: "nouveautes" as const,
              icon: <Bell className="w-5 h-5" />,
              label: "Nouveautés HotelBenin",
              desc: "Nouveaux hôtels, fonctionnalités",
            },
          ].map((notif) => (
            <div
              key={notif.key}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-white rounded-lg text-slate-600">
                  {notif.icon}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{notif.label}</p>
                  <p className="text-xs text-slate-500">{notif.desc}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleNotification(notif.key);
                  toast.success(
                    preferences.notifications[notif.key]
                      ? `${notif.label} désactivées`
                      : `${notif.label} activées`,
                    { duration: 2000 }
                  );
                }}
                className={`relative w-12 h-6 rounded-full transition ${
                  preferences.notifications[notif.key]
                    ? "bg-blue-500"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.notifications[notif.key]
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-800">
            ✅ Les préférences sont enregistrées automatiquement
          </p>
        </div>
      </Card>

      {/* ============ CONFIDENTIALITÉ ============ */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-600" />
          Confidentialité
        </h3>

        <p className="text-sm text-slate-600 mb-4">
          Contrôlez qui peut voir vos informations.
        </p>

        <div className="space-y-3">
          {[
            {
              key: "profilPublic" as const,
              label: "Profil public",
              desc: "Rendre votre profil visible aux autres utilisateurs",
            },
            {
              key: "partagerAvis" as const,
              label: "Partager mes avis",
              desc: "Permettre aux hôtels de voir vos avis anciens",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button
                onClick={() => {
                  toggleConfidentialite(item.key);
                  toast.success(
                    preferences.confidentialite[item.key]
                      ? `${item.label} désactivé`
                      : `${item.label} activé`,
                    { duration: 2000 }
                  );
                }}
                className={`relative w-12 h-6 rounded-full transition ${
                  preferences.confidentialite[item.key]
                    ? "bg-green-500"
                    : "bg-slate-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.confidentialite[item.key]
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* ============ SÉCURITÉ ============ */}
      <Card>
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          Sécurité & Compte
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={getPasswordLink()}>
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-red-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Mot de passe</p>
                <p className="text-xs text-slate-500">Modifier</p>
              </div>
            </div>
          </Link>

          <Link href={getProfilLink()}>
            <div className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition cursor-pointer flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-blue-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Mon profil</p>
                <p className="text-xs text-slate-500">Modifier mes infos</p>
              </div>
            </div>
          </Link>
        </div>
      </Card>

      {/* ============ ZONE DANGEREUSE ============ */}
      {user?.role !== "admin" && (
        <Card className="border-2 border-red-200 bg-red-50">
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Zone dangereuse
          </h3>
          <p className="text-sm text-red-800 mb-4">
            Ces actions sont irréversibles. Procédez avec prudence.
          </p>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Supprimer mon compte
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-white border border-red-300 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-2">
                  ⚠️ Cette action est définitive
                </p>
                <ul className="text-xs text-red-700 mb-3 space-y-1">
                  <li>• Toutes vos données seront supprimées</li>
                  <li>• Vos réservations seront annulées</li>
                  <li>• Vous ne pourrez plus vous connecter</li>
                  <li>• Cette action est <strong>irréversible</strong></li>
                </ul>
                <p className="text-xs text-red-700 mb-3">
                  Tapez <strong className="font-mono">SUPPRIMER</strong> pour
                  confirmer.
                </p>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-3 py-2 border-2 border-red-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteText("");
                  }}
                  disabled={deleting}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteText !== "SUPPRIMER"}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  icon={
                    deleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )
                  }
                >
                  {deleting ? "Suppression..." : "Confirmer la suppression"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Message pour admin */}
      {user?.role === "admin" && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 text-sm mb-1">
                Compte administrateur
              </p>
              <p className="text-xs text-blue-800">
                Le compte administrateur ne peut pas être supprimé depuis
                l&apos;interface. Contactez le support technique si nécessaire.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}