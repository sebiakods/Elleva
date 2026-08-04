"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API = process.env.NEXT_PUBLIC_API_URL;

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  status: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const res = await fetch(`${API}/categories`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) {
        throw new Error("Impossible de charger les catégories.");
      }

      const data = await res.json();

      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Supprimer cette catégorie ?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;

      const res = await fetch(`${API}/categories/${id}`, {
        method: "DELETE",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      if (!res.ok) {
        throw new Error("Suppression impossible.");
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== id)
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Header title="Catégories" />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">
            Catégories de financement
          </h2>

          <p className="text-sm text-ink-soft">
            {categories.length} catégorie
            {categories.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link href="/admin/categories/new">
          <Button>
            <Plus size={16} />
            Nouvelle catégorie
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="card-surface rounded-2xl p-10 text-center shadow-card">
          Chargement...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="card-surface rounded-2xl p-12 text-center shadow-card">
          <h3 className="mb-2 text-lg font-semibold">
            Aucune catégorie
          </h3>

          <p className="mb-6 text-sm text-ink-soft">
            Commencez par créer votre première catégorie.
          </p>

          <Link href="/admin/categories/new">
            <Button>
              <Plus size={16} />
              Nouvelle catégorie
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card-surface overflow-hidden rounded-2xl shadow-card"
            >
              <div
                className="h-24"
                style={{
                  background: category.image
                    ? `url(${category.image}) center/cover`
                    : category.color || "#9C0E4A",
                }}
              />

              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-ink">
                      {category.name}
                    </h3>

                    <p className="text-xs text-ink-soft">
                      /{category.slug}
                    </p>
                  </div>

                  {category.featured && (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                      ⭐ À la une
                    </span>
                  )}
                </div>

                <p className="mb-5 line-clamp-3 text-sm text-ink-soft">
                  {category.description || "Aucune description"}
                </p>

                <div className="mb-5 flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      category.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.status === "active"
                      ? "Active"
                      : "Masquée"}
                  </span>

                  {category.color && (
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{
                          backgroundColor: category.color,
                        }}
                      />

                      <span className="text-xs text-gray-500">
                        {category.color}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/categories/${category.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="secondary"
                      className="w-full"
                    >
                      <Pencil size={15} />
                      Modifier
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    onClick={() => handleDelete(category.id)}
                    className={`bg-red-600 hover:bg-red-700 ${
                      deletingId === category.id
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  >
                    <Trash2 size={15} />

                    {deletingId === category.id ? "..." : ""}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}