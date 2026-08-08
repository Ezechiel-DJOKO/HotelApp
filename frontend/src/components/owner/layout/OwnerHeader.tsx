"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Bell,
  Menu,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import NotificationBell from "@/components/shared/notifications/NotificationBell";
import GoogleTranslate from "@/components/shared/ui/GoogleTranslate";
import ThemeToggle from "@/components/shared/ui/ThemeToggle";

interface OwnerHeaderProps {
  onMenuClick: () => void;
}

export default function OwnerHeader({ onMenuClick }: OwnerHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    router.push("/");
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition mr-2"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-semibold text-slate-700 hidden sm:block">
          Espace Propriétaire
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <GoogleTranslate />
       <NotificationBell color="purple" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
              {user.prenom?.charAt(0)}
              {user.nom?.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">
                {user.prenom}
              </p>
              <p className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight font-semibold">
                Propriétaire
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user.prenom} {user.nom}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Link
                href="/owner/profil"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
              >
                <User className="w-4 h-4" />
                Mon Profil
              </Link>
              <div className="border-t border-slate-100 mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}