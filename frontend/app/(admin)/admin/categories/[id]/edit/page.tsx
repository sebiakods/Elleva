"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";

const API = process.env.NEXT_PUBLIC_API_URL;

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  color: string;
  status: "active" | "hidden";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "",
    color: "#9C0E4A",
    status: "active",
    featured: false,
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    async function loadCategory() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API}/categories/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Impossible de charger la catégorie.");
        const data = await res.json();

        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          image: data.image ?? "",
          icon: data.icon ?? "",
          color: data.color ?? "#9C0E4A",
          status: data.status ?? "active",
          featured: data.featured ?? false,
          seoTitle: data.seoTitle ?? "",
          seoDescription: data.seoDescription ?? "",
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCategory();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Impossible de modifier la catégorie.");

      router.push("/admin/categories");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Modifier la catégorie" />
        <div className="p-8">Chargement...</div>
      </>
    );
  }

  return (
    <>
      <Header title="Modifier la catégorie" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="card-surface rounded-2xl p-6 shadow-card space-y-6">
          <h2 className="text-xl font-semibold">Informations générales</h2>

          <div>
            <label className="mb-2 block text-sm font-medium">Nom</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Slug</label>
            <input name="slug" value={form.slug} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea rows={5} name="description" value={form.description} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Image</label>
            <input name="image" value={form.image} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Icône</label>
              <input name="icon" value={form.icon} onChange={handleChange} className="w-full rounded-xl border p-3" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Couleur</label>
              <input type="color" name="color" value={form.color} onChange={handleChange} className="h-12 w-full rounded-xl border" />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Statut</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-xl border p-3">
                <option value="active">Active</option>
                <option value="hidden">Masquée</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
                Catégorie mise en avant
              </label>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-2xl p-6 shadow-card space-y-5">
          <h2 className="text-xl font-semibold">SEO</h2>
          <div>
            <label className="mb-2 block text-sm font-medium">SEO Title</label>
            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">SEO Description</label>
            <textarea rows={4} name="seoDescription" value={form.seoDescription} onChange={handleChange} className="w-full rounded-xl border p-3" />
          </div>
        </div>

        <div className="card-surface rounded-2xl p-6 shadow-card">
          <h2 className="mb-5 text-xl font-semibold">Aperçu</h2>
          <div className="overflow-hidden rounded-2xl border bg-white">
            <div className="h-32" style={{ background: form.image ? `url(${form.image}) center/cover` : form.color }} />
            <div className="p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: form.color }}>
                  {form.icon ? form.icon.substring(0, 2).toUpperCase() : "IC"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{form.name || "Nom de la catégorie"}</h3>
                  <p className="text-sm text-gray-500">/{form.slug || "slug"}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-6">
                {form.description || "La description de la catégorie apparaîtra ici."}
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: form.color }}>
                  {form.status === "active" ? "ACTIVE" : "MASQUÉE"}
                </span>
                {form.featured && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">⭐ À la une</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border px-5 py-2.5 font-medium hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-purple-600 px-5 py-2.5 font-medium text-white hover:bg-purple-700 disabled:opacity-60"
          >
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </>
  );
}