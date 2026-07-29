"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import OwnerSidebar from "./OwnerSidebar";
import OwnerHeader from "./OwnerHeader";
import Loader from "@/components/shared/ui/Loader";

interface OwnerLayoutProps {
  children: React.ReactNode;
}

export default function OwnerLayout({ children }: OwnerLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // ⚠️ Seuls owner et admin peuvent accéder
    if (user && user.role !== "owner" && user.role !== "admin") {
      router.push("/client");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (
    !hasHydrated ||
    !isAuthenticated ||
    !user ||
    (user.role !== "owner" && user.role !== "admin")
  ) {
    return <Loader fullPage label="Chargement..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <OwnerHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}