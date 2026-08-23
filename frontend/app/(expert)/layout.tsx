"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ExpertSidebar } from "@/components/layout/Expertsidebar";
import authService from "@/services/auth";

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkExpert() {
      const isExpert = await authService.isExpert();

      if (!isExpert) {
        router.replace("/login");
        return;
      }

      if (mounted) {
        setChecking(false);
      }
    }

    checkExpert();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking) {
    return null;
  }

  return (
    <div className="flex">
      <ExpertSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
