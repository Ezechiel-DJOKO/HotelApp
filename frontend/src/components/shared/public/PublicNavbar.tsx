"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  Hotel,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import GoogleTranslate from "@/components/shared/ui/GoogleTranslate";
import ThemeToggle from "../ui/ThemeToggle";

export default function PublicNavbar() {
  const { isAuthenticated, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "owner") return "/owner";
    return "/client";
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Hotel className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              Hotel<span className="text-blue-600">Benin</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Accueil
            </Link>
            <Link
              href="/hotels"
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              Hôtels
            </Link>

            {isAuthenticated ? (
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/hotels"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
            >
              Hôtels
            </Link>

            {isAuthenticated ? (
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 mx-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition justify-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                Mon espace
              </Link>
              
            ) : (
              
              <>
                <ThemeToggle />
                <GoogleTranslate />
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 mx-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}