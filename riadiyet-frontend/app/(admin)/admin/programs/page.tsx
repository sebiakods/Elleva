"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { ProgramTable } from "@/components/admin/ProgramTable";

export default function AdminProgramsPage() {
  const router = useRouter();

  return (
    <>
      <Header title="Programmes de financement" />

      <div className="mb-5 flex justify-end">
        <Button onClick={() => router.push("/admin/programs/new")}>
          <Plus size={16} />
          Ajouter un programme
        </Button>
      </div>

      <ProgramTable />
    </>
  );
}