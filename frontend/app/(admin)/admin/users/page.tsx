"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { UsersTable } from "@/components/admin/UsersTable";

const ROLE_OPTIONS = [
  { value: "", label: "Tous les rôles" },
  { value: "ENTREPRENEUR", label: "Entrepreneures" },
  { value: "EXPERT", label: "Expertes" },
  { value: "INSTITUTION", label: "Institutions" },
  { value: "ADMIN", label: "Admins" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  return (
    <div className="p-6 md:p-8">
      {/* Breadcrumb */}
      <div className="mb-8 text-sm text-ink-soft">
        <span>Espace Administration</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">
          Utilisateurs
        </span>
      </div>

      {/* Header */}
      <div className="relative mb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <p className="font-script text-2xl leading-none text-rose-500">
          Administration,
        </p>

        <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
          Gestion des{" "}
          <span className="text-gradient-rise">
            utilisateurs
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
          Gérez les comptes, les rôles et les accès des
          utilisatrices et utilisateurs de la plateforme Ellevadz.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100">
          <Search
            size={16}
            className="shrink-0 text-ink-soft"
          />

          <input
            type="text"
            placeholder="Rechercher un utilisateur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none transition-all focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Users */}
      <div className="card-surface shadow-card">
        <UsersTable
          search={search}
          role={role}
        />
      </div>
    </div>
  );
}