"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ClientSidebar from "./ClientSidebar";
import ClientHeader from "./ClientHeader";
import Loader from "@/components/shared/ui/Loader";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // ⚠️ Rediriger si l'utilisateur n'est pas un client
    if (user && user.role === "admin") {
      router.push("/admin");
    } else if (user && user.role === "owner") {
      router.push("/owner");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!hasHydrated || !isAuthenticated || !user) {
    return <Loader fullPage label="Chargement..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ClientSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-64 min-h-screen flex flex-col">
        <ClientHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}