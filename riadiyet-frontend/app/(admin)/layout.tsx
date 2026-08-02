"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-sand-50">
      <AdminSidebar />
      <main className="flex-1 px-6 py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}