"use client";

import { useRouter } from "next/navigation";
import { Plus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ProgramTable } from "@/components/admin/ProgramTable";

export default function AdminProgramsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sand-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 rounded-2xl border border-sand-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <p className="font-body flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
              <ShieldCheck size={14} />
              Espace Admin
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold text-wine-700 md:text-4xl">
              Programmes de financement
            </h1>
            <p className="font-body mt-2 text-ink-soft">
              Tous les programmes enregistrés dans la base de données.
            </p>
          </div>


        </div>

        {/* Real database programs */}
        <ProgramTable />
      </div>
    </div>
  );
}