"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import authService from "@/services/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkEntrepreneur() {
      const isEntrepreneur = await authService.isEntrepreneur();

      if (!isEntrepreneur) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setChecking(false);
      }
    }

    checkEntrepreneur();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-sand-50">
      <DashboardSidebar />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}