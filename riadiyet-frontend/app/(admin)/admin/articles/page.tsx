"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type Article = {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTimeMinutes: number;
  createdAt: string;
  isPublished: boolean;
};

export default function AdminArticlesPage() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/articles/all`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Impossible de charger les articles.");
      }

      const data = await res.json();

      // Supports both:
      // res.json(article[])
      // res.json({ success:true, data:[...] })
      setArticles(Array.isArray(data) ? data : (data.data ?? []));
    } catch (error) {
      console.error(error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Erreur");
      }

      setArticles((prev) => prev.filter((article) => article.id !== id));

      alert("Article supprimé avec succès.");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <>
      <Header title="Gestion des articles" />

      <div className="mb-5 flex justify-end">
        <Button onClick={() => router.push("/admin/articles/new")}>
          <Plus size={16} />
          <span className="ml-2">Nouvel article</span>
        </Button>
      </div>

      <div className="card-surface overflow-x-auto shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-sand-200 bg-sand-50">
              <th className="px-5 py-3.5 font-semibold">Titre</th>
              <th className="px-5 py-3.5 font-semibold">Catégorie</th>
              <th className="px-5 py-3.5 font-semibold">
                Temps de lecture
              </th>
              <th className="px-5 py-3.5 font-semibold">Date</th>
              <th className="px-5 py-3.5 font-semibold">Statut</th>
              <th className="px-5 py-3.5 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
                  Chargement...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-gray-500"
                >
                  Aucun article.
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-sand-100 hover:bg-rose-50/40"
                >
                  <td className="max-w-xs px-5 py-4 font-medium">
                    {article.title}
                  </td>

                  <td className="px-5 py-4">
                    <Badge tone="rose">
                      {article.category}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    {article.readTimeMinutes} min
                  </td>

                  <td className="px-5 py-4">
                    {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                  </td>

                  <td className="px-5 py-4">
                    <Badge
                      tone={article.isPublished ? "gold" : "neutral"}
                    >
                      {article.isPublished ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}