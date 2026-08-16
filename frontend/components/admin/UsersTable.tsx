"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  CalendarDays,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import authService from "@/services/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roleMap: Record<string, string> = {
  ENTREPRENEUR: "Entrepreneure",
  EXPERT: "Experte",
  INSTITUTION: "Institution",
  ADMIN: "Admin",
};

const roleTone: Record<string, "gold" | "wine" | "rose"> = {
  ENTREPRENEUR: "rose",
  EXPERT: "wine",
  INSTITUTION: "gold",
  ADMIN: "wine",
};

interface UsersTableProps {
  search?: string;
  role?: string;
}

export function UsersTable({
  search = "",
  role = "",
}: UsersTableProps) {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timeout);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError(null);

    try {
      const token = authService.getToken();

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (role) {
        params.set("role", role);
      }

      params.set("limit", "50");

      const res = await fetch(
        `${API_URL}/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Impossible de charger les utilisateurs."
        );
      }

      let usersData: User[] = [];

      if (Array.isArray(data)) {
        usersData = data;
      } else if (Array.isArray(data.data)) {
        usersData = data.data;
      } else if (Array.isArray(data.data?.users)) {
        usersData = data.data.users;
      } else if (Array.isArray(data.data?.items)) {
        usersData = data.data.items;
      }

      setUsers(usersData);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue"
      );

      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: User) {
    try {
      const token = authService.getToken();

      const action = user.isActive
        ? "suspend"
        : "activate";

      const res = await fetch(
        `${API_URL}/users/${user.id}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Action impossible"
        );
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? {
                ...u,
                isActive: !user.isActive,
              }
            : u
        )
      );
    } catch (err) {
      console.error(
        "TOGGLE ACTIVE ERROR:",
        err
      );

      alert(
        "Impossible de modifier le statut de cet utilisateur."
      );
    }
  }

  async function deleteUser(id: string) {
    if (
      !window.confirm(
        "Supprimer cet utilisateur définitivement ?"
      )
    ) {
      return;
    }

    try {
      const token = authService.getToken();

      const res = await fetch(
        `${API_URL}/users/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Delete failed"
        );
      }

      setUsers((prev) =>
        prev.filter((user) => user.id !== id)
      );
    } catch (err) {
      console.error("DELETE ERROR:", err);

      alert(
        "Impossible de supprimer cet utilisateur."
      );
    }
  }

  /* =========================
     LOADING
  ========================== */

  if (loading) {
    return (
      <div className="card-surface overflow-hidden shadow-card">
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 h-10 w-10 animate-pulse rounded-full bg-rose-100" />

          <p className="text-sm font-medium text-ink">
            Chargement des utilisateurs
          </p>

          <p className="mt-1 text-xs text-ink-soft">
            Veuillez patienter quelques instants...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================== */

  if (error) {
    return (
      <div className="card-surface shadow-card">
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Users size={20} />
          </div>

          <p className="text-sm font-semibold text-ink">
            Impossible de charger les utilisateurs
          </p>

          <p className="mt-1 max-w-md text-xs leading-5 text-ink-soft">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchUsers}
            className="mt-5 rounded-xl bg-rise-gradient px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="card-surface overflow-hidden shadow-card"
    >
      {/* =========================
          TABLE HEADER
      ========================== */}

      <div className="flex flex-col gap-3 border-b border-sand-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-wine-900">
            Utilisateurs
          </h2>

          <p className="mt-1 text-xs text-ink-soft">
            {users.length}{" "}
            {users.length > 1
              ? "utilisateurs"
              : "utilisateur"}{" "}
            affiché{users.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600">
          <Users size={13} />
          Gestion des comptes
        </div>
      </div>

      {/* =========================
          TABLE
      ========================== */}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-sand-100 bg-sand-50/60">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Utilisateur
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Rôle
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Statut
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Inscription
              </th>

              <th className="w-16 px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-sand-100">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-14"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sand-50 text-ink-soft">
                      <Users size={21} />
                    </div>

                    <p className="text-sm font-semibold text-ink">
                      Aucun utilisateur trouvé
                    </p>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-ink-soft">
                      Aucun compte ne correspond aux
                      critères de recherche actuels.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const initials =
                  user.name
                    ?.trim()
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) =>
                      part.charAt(0).toUpperCase()
                    )
                    .join("") || "?";

                return (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-rose-50/30"
                  >
                    {/* USER */}

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rise-gradient text-sm font-semibold text-white shadow-sm">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {user.name || "Utilisateur"}
                          </p>

                          <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                            <Mail
                              size={11}
                              className="shrink-0"
                            />

                            <span className="truncate">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td className="px-5 py-4">
                      <Badge
                        tone={
                          roleTone[user.role] ??
                          "rose"
                        }
                      >
                        {roleMap[user.role] ??
                          user.role}
                      </Badge>
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            user.isActive
                              ? "bg-emerald-500"
                              : "bg-rose-400"
                          }`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            user.isActive
                              ? "text-emerald-700"
                              : "text-rose-600"
                          }`}
                        >
                          {user.isActive
                            ? "Actif"
                            : "Suspendu"}
                        </span>
                      </div>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs text-ink-soft">
                        <CalendarDays
                          size={13}
                          className="shrink-0"
                        />

                        <span>
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="relative px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === user.id
                              ? null
                              : user.id
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink focus-ring"
                        aria-label={`Actions pour ${user.name}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenu === user.id && (
                        <div className="absolute right-5 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-sand-200 bg-white p-1.5 text-left shadow-xl">
                          {/* View */}

                          <button
                            type="button"
                            onClick={() => {
                              router.push(
                                `/admin/users/${user.id}`
                              );
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink transition-colors hover:bg-sand-50"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-50 text-ink-soft">
                              <Eye size={15} />
                            </span>

                            <span>
                              <span className="block font-medium">
                                Voir le profil
                              </span>

                              <span className="block text-[11px] text-ink-soft">
                                Consulter les détails
                              </span>
                            </span>
                          </button>

                          {/* Status */}

                          <button
                            type="button"
                            onClick={() => {
                              toggleActive(user);
                              setOpenMenu(null);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-sand-50 ${
                              user.isActive
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }`}
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-50">
                              {user.isActive ? (
                                <Ban size={15} />
                              ) : (
                                <CheckCircle
                                  size={15}
                                />
                              )}
                            </span>

                            <span>
                              <span className="block font-medium">
                                {user.isActive
                                  ? "Suspendre"
                                  : "Réactiver"}
                              </span>

                              <span className="block text-[11px] text-ink-soft">
                                Modifier l'accès
                              </span>
                            </span>
                          </button>

                          <div className="my-1.5 border-t border-sand-100" />

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() => {
                              deleteUser(user.id);
                              setOpenMenu(null);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                              <Trash2 size={15} />
                            </span>

                            <span>
                              <span className="block font-medium">
                                Supprimer
                              </span>

                              <span className="block text-[11px] text-rose-400">
                                Action définitive
                              </span>
                            </span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}