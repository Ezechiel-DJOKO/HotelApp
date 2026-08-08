"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Loader from "@/components/shared/ui/Loader";
import ClientSidebar from "@/components/client/layout/ClientSidebar";
import ClientHeader from "@/components/client/layout/ClientHeader";
import OwnerSidebar from "@/components/owner/layout/OwnerSidebar";
import OwnerHeader from "@/components/owner/layout/OwnerHeader";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminHeader from "@/components/admin/layout/AdminHeader";

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export default function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || !user) {
    return <Loader fullPage label="Chargement..." />;
  }

  // Choisir la sidebar et header selon le rôle
  const renderSidebar = () => {
    if (user.role === "admin") {
      return (
        <AdminSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      );
    }
    if (user.role === "owner") {
      return (
        <OwnerSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />
      );
    }
    return (
      <ClientSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    );
  };

  const renderHeader = () => {
    if (user.role === "admin") {
      return <AdminHeader onMenuClick={() => setMobileOpen(true)} />;
    }
    if (user.role === "owner") {
      return <OwnerHeader onMenuClick={() => setMobileOpen(true)} />;
    }
    return <ClientHeader onMenuClick={() => setMobileOpen(true)} />;
  };

  const getBgColor = () => {
    if (user.role === "admin") return "bg-slate-100";
    return "bg-slate-50";
  };

  return (
    <div className={`min-h-screen ${getBgColor()}`}>
      {renderSidebar()}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {renderHeader()}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}