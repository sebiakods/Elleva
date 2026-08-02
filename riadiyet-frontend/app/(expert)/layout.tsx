"use client";

import { ExpertSidebar } from "@/components/layout/Expertsidebar";

export default function ExpertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <ExpertSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}