
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

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/+$/, "");

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
  ADMIN: "Administrateur",
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

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();

    if (data && typeof data === "object") {
      const payload = data as {
        message?: unknown;
        error?: unknown;
        data?: {
          message?: unknown;
          error?: unknown;
        };
      };

      if (typeof payload.message === "string") {
        return payload.message;
      }

      if (typeof payload.error === "string") {
        return payload.error;
      }

      if (
        payload.data &&
        typeof payload.data.message === "string"
      ) {
        return payload.data.message;
      }

      if (
        payload.data &&
        typeof payload.data.error === "string"
      ) {
        return payload.data.error;
      }
    }
  } catch {
    // Response is not JSON.
  }

  return `Erreur ${response.status}`;
}

function extractUsers(data: unknown): User[] {
  if (Array.isArray(data)) {
    return data as User[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const payload = data as {
    data?: unknown;
    users?: unknown;
    items?: unknown;
  };

  if (Array.isArray(payload.users)) {
    return payload.users as User[];
  }

  if (Array.isArray(payload.items)) {
    return payload.items as User[];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as User[];
  }

  if (
    payload.data &&
    typeof payload.data === "object"
  ) {
    const nested = payload.data as {
      users?: unknown;
      items?: unknown;
    };

    if (Array.isArray(nested.users)) {
      return nested.users as User[];
    }

    if (Array.isArray(nested.items)) {
      return nested.items as User[];
    }
  }

  return [];
}

function formatDate(date?: string): string {
  if (!date) {
    return "-";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  /**
   * ============================================================
   * FETCH USERS
   * ============================================================
   *
   * Authentication is handled exclusively by the httpOnly
   * session cookie.
   *
   * IMPORTANT:
   * - No localStorage
   * - No sessionStorage
   * - No accessToken
   * - No refreshToken
   * - No Authorization: Bearer header
   *
   * credentials: "include" sends the httpOnly cookie.
   */
  async function fetchUsers(
    signal?: AbortSignal
  ): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (role) {
        params.set("role", role);
      }

      params.set("limit", "50");

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/users${query ? `?${query}` : ""}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
          signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const data: unknown = await response.json();

      if (signal?.aborted) {
        return;
      }

      setUsers(extractUsers(data));
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        return;
      }

      if (signal?.aborted) {
        return;
      }

      console.error("FETCH USERS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les utilisateurs."
      );

      setUsers([]);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  /**
   * ============================================================
   * LOAD USERS WHEN SEARCH / ROLE CHANGES
   * ============================================================
   */
  useEffect(() => {
    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      void fetchUsers(controller.signal);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };

    // fetchUsers intentionally depends on search/role.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, role]);

  /**
   * ============================================================
   * CLOSE ACTION MENU WHEN CLICKING OUTSIDE
   * ============================================================
   */
  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      const target = event.target;

      if (
        menuRef.current &&
        target instanceof Node &&
        !menuRef.current.contains(target)
      ) {
        setOpenMenu(null);
      }
    }

    document.addEventListener(
      "mousedown",
      closeMenu
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu
      );
    };
  }, []);

  /**
   * ============================================================
   * ACTIVATE / SUSPEND USER
   * ============================================================
   */
  async function toggleActive(
    user: User
  ): Promise<void> {
    const userId = user.id;

    if (!userId) {
      window.alert(
        "Identifiant utilisateur manquant."
      );
      return;
    }

    if (actionLoading !== null) {
      return;
    }

    const action = user.isActive
      ? "suspend"
      : "activate";

    const confirmed = window.confirm(
      user.isActive
        ? `Voulez-vous vraiment suspendre ${user.name} ?`
        : `Voulez-vous vraiment réactiver ${user.name} ?`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(userId);

    try {
      const response = await fetch(
        `${API_URL}/users/${encodeURIComponent(
          userId
        )}/${action}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      const data: unknown =
        await response.json().catch(() => null);

      let updatedIsActive: boolean | null = null;

      if (data && typeof data === "object") {
        const payload = data as {
          data?: unknown;
          user?: unknown;
        };

        const candidates = [
          payload.user,
          payload.data,
        ];

        for (const candidate of candidates) {
          if (
            candidate &&
            typeof candidate === "object"
          ) {
            const candidateUser = candidate as {
              user?: unknown;
              isActive?: unknown;
            };

            if (
              typeof candidateUser.isActive ===
              "boolean"
            ) {
              updatedIsActive =
                candidateUser.isActive;
              break;
            }

            if (
              candidateUser.user &&
              typeof candidateUser.user ===
                "object"
            ) {
              const nestedUser =
                candidateUser.user as {
                  isActive?: unknown;
                };

              if (
                typeof nestedUser.isActive ===
                "boolean"
              ) {
                updatedIsActive =
                  nestedUser.isActive;
                break;
              }
            }
          }
        }
      }

      const nextIsActive =
        updatedIsActive ?? !user.isActive;

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === userId
            ? {
                ...currentUser,
                isActive: nextIsActive,
              }
            : currentUser
        )
      );
    } catch (err) {
      console.error(
        "TOGGLE ACTIVE ERROR:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de modifier le statut de cet utilisateur."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * ============================================================
   * DELETE USER
   * ============================================================
   */
  async function deleteUser(
    id: string
  ): Promise<void> {
    const userId = id;

    if (!userId) {
      window.alert(
        "Identifiant utilisateur manquant."
      );
      return;
    }

    if (actionLoading !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer cet utilisateur définitivement ?"
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(userId);

    try {
      const response = await fetch(
        `${API_URL}/users/${encodeURIComponent(
          userId
        )}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(response)
        );
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (currentUser) =>
            currentUser.id !== userId
        )
      );
    } catch (err) {
      console.error(
        "DELETE USER ERROR:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer cet utilisateur."
      );
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */
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

  /**
   * ============================================================
   * ERROR
   * ============================================================
   */
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
            onClick={() => {
              void fetchUsers();
            }}
            className="mt-5 rounded-xl bg-rise-gradient px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /**
   * ============================================================
   * TABLE
   * ============================================================
   */
  return (
    <div
      ref={menuRef}
      className="card-surface overflow-hidden shadow-card"
    >
      {/* TABLE HEADER */}
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

      {/* TABLE */}
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
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) =>
                      part.charAt(0).toUpperCase()
                    )
                    .join("") || "?";

                const isActionLoading =
                  actionLoading === user.id;

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
                            {user.name ||
                              "Utilisateur"}
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
                          {formatDate(
                            user.createdAt
                          )}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="relative px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() =>
                          setOpenMenu(
                            openMenu === user.id
                              ? null
                              : user.id
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand-100 hover:text-ink focus-ring disabled:pointer-events-none disabled:opacity-50"
                        aria-label={`Actions pour ${user.name}`}
                        aria-expanded={
                          openMenu === user.id
                        }
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openMenu === user.id && (
                        <div className="absolute right-5 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-sand-200 bg-white p-1.5 text-left shadow-xl">
                          {/* VIEW */}
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);

                              router.push(
                                `/admin/users/${encodeURIComponent(
                                  user.id
                                )}`
                              );
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

                          {/* STATUS */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => {
                              setOpenMenu(null);
                              void toggleActive(
                                user
                              );
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-sand-50 disabled:pointer-events-none disabled:opacity-50 ${
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

                          {/* DELETE */}
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => {
                              setOpenMenu(null);
                              void deleteUser(
                                user.id
                              );
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50"
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
