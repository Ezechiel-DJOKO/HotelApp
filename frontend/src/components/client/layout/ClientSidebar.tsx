"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Calendar,
  Heart,
  User,
  Key,
  X,
  Hotel,
  Compass,
  Bell,
  HelpCircle,
  Settings,
  FileText,
  Briefcase,
  TrendingUp,
} from "lucide-react";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface ClientSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function ClientSidebar({
  mobileOpen,
  onClose,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const sections: MenuSection[] = [
    {
      title: "Découvrir",
      items: [
        {
          label: "Explorer",
          href: "/hotels",
          icon: <Compass className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Mon espace",
      items: [
        {
          label: "Mes Réservations",
          href: "/client",
          icon: <Calendar className="w-5 h-5" />,
        },
        {
          label: "Mes Favoris",
          href: "/client/favoris",
          icon: <Heart className="w-5 h-5" />,
        },
        {
          label: "Mes Demandes",
          href: "/client/mes-demandes",
          icon: <FileText className="w-5 h-5" />,
        },
      ],
    },
    {
    title: "Investir",
    items: [
      {
        label: "Opportunités",
        href: "/client/investir",
        icon: <TrendingUp className="w-5 h-5" />,
      },
      {
        label: "Mes Projets",
        href: "/client/mes-opportunites",
        icon: <Briefcase className="w-5 h-5" />,
      },
    ],
  },
    {
  title: "Mon compte",
  items: [
    {
      label: "Profil",
      href: "/client/profil",
      icon: <User className="w-5 h-5" />,
    },
    {
      label: "Notifications",
      href: "/notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      label: "Paramètres",
      href: "/parametres",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: "Aide",
      href: "/aide",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      label: "Mot de passe",
      href: "/client/password",
      icon: <Key className="w-5 h-5" />,
    },
  ],
},
  ];

  const SidebarContent = () => (
    <>
      {/* Logo Client */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-200 flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
          <Hotel className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">
            HotelBenin
          </p>
          <p className="text-xs bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight font-semibold">
            VOYAGEUR
          </p>
        </div>
      </div>

      {/* Info utilisateur */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.prenom?.charAt(0)}
            {user.nom?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menus */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/client" &&
                    item.href !== "/hotels" &&
                    pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 text-center">
          <Compass className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-slate-700 font-medium">
            Bon voyage ! 🌍
          </p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex-col z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition z-10"
        >
          <X className="w-5 h-5 text-slate-700" />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}