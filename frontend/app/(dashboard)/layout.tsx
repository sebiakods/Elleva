"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import authService from "@/services/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
      return;
    }

    if (!authService.isEntrepreneur()) {
      router.replace("/login");
    }
  }, [router]);

  if (
    !authService.isAuthenticated() ||
    !authService.isEntrepreneur()
  ) {
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
