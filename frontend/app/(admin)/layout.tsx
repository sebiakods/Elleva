"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { authService } from "@/services/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkAdmin() {
      const isAdmin = await authService.isAdmin();

      if (!isAdmin) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setChecking(false);
      }
    }

    checkAdmin();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-sand-50">
      <AdminSidebar />

      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}