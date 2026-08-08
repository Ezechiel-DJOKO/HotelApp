"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Hotel,
  Users,
  UserCog,
  ClipboardList,
  ShieldCheck,
  User,
  Key,
  X,
  ShieldAlert,
  CreditCard,
  Wallet,
  UserPlus,
  Bell,
  Settings,
  HelpCircle,
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

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (!user) return null;

  const sections: MenuSection[] = [
    {
      title: "Vue d'ensemble",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: <LayoutDashboard className="w-5 h-5" />,
        },
      ],
    },
    {
      title: "Gestion",
      items: [
        {
          label: "Hôtels",
          href: "/admin/hotels",
          icon: <Hotel className="w-5 h-5" />,
        },
        {
          label: "Propriétaires",
          href: "/admin/owners",
          icon: <UserCog className="w-5 h-5" />,
        },
        {
          label: "Clients",
          href: "/admin/clients",
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: "Réservations",
          href: "/admin/reservations",
          icon: <ClipboardList className="w-5 h-5" />,
        },
        {
          label: "Transactions",
          href: "/admin/transactions",
          icon: <CreditCard className="w-5 h-5" />,
        },
        {
          label: "Reversements",
          href: "/admin/reversements",
          icon: <Wallet className="w-5 h-5" />,
        },
        {
          label: "Vérifications",
          href: "/admin/verifications",
          icon: <ShieldCheck className="w-5 h-5" />,
        },
        {
          label: "Demandes propriétaires",
          href: "/admin/demandes-proprietaire",
          icon: <UserPlus className="w-5 h-5" />,
        },
        {
          label: "Opportunités",
          href: "/admin/opportunites",
          icon: <TrendingUp className="w-5 h-5" />,
        },
      ],
    },
    {
  title: "Mon compte",
  items: [
    {
      label: "Profil",
      href: "/admin/profil",
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
      href: "/admin/password",
      icon: <Key className="w-5 h-5" />,
    },
  ],
},
  ];

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-700 flex-shrink-0">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-lg">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">
            HotelBenin
          </p>
          <p className="text-xs text-red-300 leading-tight font-semibold">
            ADMIN
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.prenom?.charAt(0)}
            {user.nom?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.prenom} {user.nom}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition ${
                        isActive
                          ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
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

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
          <ShieldAlert className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-xs text-slate-300">Zone Administrateur</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-slate-900 flex-col z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        />
      )}

      <aside
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-slate-900 z-50 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}