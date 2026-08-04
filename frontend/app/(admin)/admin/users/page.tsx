import { Search } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { UsersTable } from "@/components/admin/UsersTable";

export default function AdminUsersPage() {
  return (
    <>
      <Header title="Gestion des utilisateurs" />

      <div className="mb-5 flex">
        <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2">
          <Search size={15} className="text-ink-soft" />
          <input
            placeholder="Rechercher un utilisateur…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60"
          />
        </div>
      </div>

      <UsersTable />
    </>
  );
}