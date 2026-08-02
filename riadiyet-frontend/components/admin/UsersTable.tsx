"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
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

export function UsersTable() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    function closeMenu(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
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

    try {
      const token = authService.getToken();

      const res = await fetch(`${API_URL}/users`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Status:", res.status);

      const data = await res.json();

      console.log("Users response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Impossible de charger les utilisateurs.");
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
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Supprimer cet utilisateur définitivement ?")) {
      return;
    }

    try {
      const token = authService.getToken();

      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.error("DELETE ERROR:", error);
      alert("Impossible de supprimer cet utilisateur.");
    }
  }

  if (loading) {
    return (
      <div className="p-5 text-center">
        Chargement des utilisateurs...
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="overflow-x-auto rounded-xl bg-white shadow"
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b bg-sand-50">
            <th className="px-5 py-3.5 font-semibold">Utilisateur</th>
            <th className="px-5 py-3.5 font-semibold">Rôle</th>
            <th className="px-5 py-3.5 font-semibold">Statut</th>
            <th className="px-5 py-3.5 font-semibold">Inscrit le</th>
            <th className="px-5 py-3.5 font-semibold">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="p-6 text-center text-gray-500"
              >
                Aucun utilisateur trouvé.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-rose-50/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rise-gradient font-bold text-white">
                      {user.name?.charAt(0) ?? "?"}
                    </div>

                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <Badge>
                    {roleMap[user.role] ?? user.role}
                  </Badge>
                </td>

                <td className="px-5 py-4">
                  <Badge>
                    {user.isActive ? "Actif" : "Suspendu"}
                  </Badge>
                </td>

                <td className="px-5 py-4 text-gray-500">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                    : "-"}
                </td>

                <td className="relative px-5 py-4">
                  <button
                    onClick={() =>
                      setOpenMenu(
                        openMenu === user.id ? null : user.id
                      )
                    }
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {openMenu === user.id && (
                    <div className="absolute right-5 z-50 mt-2 w-52 rounded-xl border bg-white shadow-xl">
                      <button
                        onClick={() => {
                          router.push(`/admin/users/${user.id}`);
                          setOpenMenu(null);
                        }}
                        className="flex w-full gap-3 p-3 hover:bg-gray-50"
                      >
                        <Eye size={16} />
                        Voir profil
                      </button>

                      <hr />

                      <button
                        onClick={() => {
                          deleteUser(user.id);
                          setOpenMenu(null);
                        }}
                        className="flex w-full gap-3 p-3 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}