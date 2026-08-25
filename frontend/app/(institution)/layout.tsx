"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { InstitutionSidebar } from "@/components/layout/InstitutionSidebar";
import authService from "@/services/auth";

export default function InstitutionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkInstitution() {
      const isInstitution = await authService.isInstitution();

      if (!isInstitution) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setChecking(false);
      }
    }

    checkInstitution();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <InstitutionSidebar />

      <main className="min-w-0 flex-1 overflow-auto px-4 pb-8 pt-20 sm:px-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
