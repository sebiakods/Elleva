"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

const API = '/api';

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

const colorOptions = [
  "#9C0E4A",
  "#2563EB",
  "#059669",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
];

const iconSuggestions = [
  "Building2",
  "Briefcase",
  "Wallet",
  "Landmark",
  "Banknote",
  "Coins",
  "PiggyBank",
  "TrendingUp",
  "Rocket",
  "Shield",
  "Users",
  "Lightbulb",
];

export default function NewCategoryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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
    if (!form.name) return;

    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((prev) => ({
      ...prev,
      slug,
    }));
  }, [form.name]);

  const completion = useMemo(() => {
    let score = 0;

    if (form.name) score += 20;
    if (form.slug) score += 10;
    if (form.description) score += 20;
    if (form.image) score += 10;
    if (form.icon) score += 10;
    if (form.seoTitle) score += 10;
    if (form.seoDescription) score += 10;
    if (form.color) score += 10;

    return score;
  }, [form]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = e.target;

    const value =
      target instanceof HTMLInputElement &&
      target.type === "checkbox"
        ? target.checked
        : target.value;

    setForm((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setError("");

  if (!form.name.trim()) {
    setError("Le nom est obligatoire.");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(`${API}/categories`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));

      throw new Error(
        data.message || "Impossible de créer la catégorie."
      );
    }

    router.push("/admin/categories");
    router.refresh();
  } catch (err: any) {
    setError(err.message || "Une erreur est survenue.");
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <Header title="Nouvelle catégorie" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl space-y-8"
      >
        <div className="grid gap-8 lg:grid-cols-[2fr_380px]">

          {/* ================= LEFT ================= */}

          <div className="space-y-6">

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-6 text-xl font-semibold">
                Informations générales
              </h2>

              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-5">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Nom de la catégorie
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ex : Financement Startup"
                    className="w-full rounded-xl border p-3 outline-none transition focus:border-primary"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Slug
                  </label>

                  <input
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    className="w-full rounded-xl border bg-gray-50 p-3"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={5}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Décrivez cette catégorie..."
                    className="w-full rounded-xl border p-3"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Image de couverture
                  </label>

                  <input
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl border p-3"
                  />

                  {form.image && (
                    <div className="mt-4 overflow-hidden rounded-xl border">

                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-64 w-full object-cover"
                      />

                    </div>
                  )}

                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Icône
                    </label>

                    <input
                      name="icon"
                      value={form.icon}
                      onChange={handleChange}
                      placeholder="Rocket"
                      className="w-full rounded-xl border p-3"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      {iconSuggestions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              icon,
                            }))
                          }
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            form.icon === icon
                              ? "border-primary bg-primary text-white"
                              : "hover:border-primary"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Couleur
                    </label>

                    <div className="grid grid-cols-4 gap-3">

                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              color,
                            }))
                          }
                          className={`h-12 rounded-xl border-2 transition ${
                            form.color === color
                              ? "border-black"
                              : "border-transparent"
                          }`}
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      ))}

                    </div>

                    <input
                      name="color"
                      value={form.color}
                      onChange={handleChange}
                      className="mt-4 w-full rounded-xl border p-3"
                    />

                  </div>

                </div>

              </div>

            </section>

            {/* ================= SEO ================= */}

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-6 text-xl font-semibold">
                SEO
              </h2>

              <div className="space-y-5">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    SEO Title
                  </label>

                  <input
                    name="seoTitle"
                    value={form.seoTitle}
                    onChange={handleChange}
                    placeholder="Titre optimisé"
                    className="w-full rounded-xl border p-3"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    SEO Description
                  </label>

                  <textarea
                    rows={4}
                    name="seoDescription"
                    value={form.seoDescription}
                    onChange={handleChange}
                    placeholder="Description SEO..."
                    className="w-full rounded-xl border p-3"
                  />

                </div>

              </div>

            </section>

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}

          <aside className="space-y-6">

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-6 text-lg font-semibold">
                Publication
              </h2>

              <div className="space-y-5">

                <div>

                  <label className="mb-2 block text-sm font-medium">
                    Statut
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border p-3"
                  >
                    <option value="active">Active</option>
                    <option value="hidden">Masquée</option>
                  </select>

                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">

                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />

                  <div>

                    <p className="font-medium">
                      Catégorie mise en avant
                    </p>

                    <p className="text-sm text-gray-500">
                      Afficher cette catégorie en priorité.
                    </p>

                  </div>

                </label>

                <Button
                  type="submit"
                  className="w-full"
                >
                  {loading
                    ? "Enregistrement..."
                    : "Enregistrer la catégorie"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => router.back()}
                >
                  Annuler
                </Button>

              </div>

            </section>

            {/* Continue with Part 3 */}
            {/* ================= PROGRESSION ================= */}

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-6 text-lg font-semibold">
                Progression
              </h2>

              <div className="space-y-4">

                <div className="flex items-center justify-between text-sm">
                  <span>Complétion</span>

                  <span className="font-semibold">
                    {completion}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${completion}%`,
                      backgroundColor: form.color,
                    }}
                  />

                </div>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span>Nom</span>
                    <span>{form.name ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Description</span>
                    <span>{form.description ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Image</span>
                    <span>{form.image ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Icône</span>
                    <span>{form.icon ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>SEO</span>

                    <span>
                      {form.seoTitle && form.seoDescription
                        ? "✅"
                        : "❌"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Publication</span>

                    <span>
                      {form.status === "active"
                        ? "🟢 Active"
                        : "⚪ Masquée"}
                    </span>
                  </div>

                </div>

              </div>

            </section>

            {/* ================= APERÇU ================= */}

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-6 text-lg font-semibold">
                Aperçu
              </h2>

              <div className="overflow-hidden rounded-2xl border bg-white">

                <div
                  className="h-28"
                  style={{
                    background: form.image
                      ? `url(${form.image}) center/cover`
                      : form.color,
                  }}
                />

                <div className="p-5">

                  <div className="mb-4 flex items-center gap-3">

                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shadow"
                      style={{
                        backgroundColor: form.color,
                      }}
                    >
                      {form.icon
                        ? form.icon.substring(0, 2).toUpperCase()
                        : "IC"}
                    </div>

                    <div>

                      <h3 className="font-semibold text-ink">
                        {form.name || "Nom de la catégorie"}
                      </h3>

                      <p className="text-sm text-ink-soft">
                        /{form.slug || "slug"}
                      </p>

                    </div>

                  </div>

                  <p className="line-clamp-4 text-sm leading-6 text-ink-soft">
                    {form.description ||
                      "La description de votre catégorie apparaîtra ici."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">

                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{
                        backgroundColor: form.color,
                      }}
                    >
                      {form.status === "active"
                        ? "ACTIVE"
                        : "MASQUÉE"}
                    </span>

                    {form.featured && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        ⭐ À la une
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </section>

            {/* Continue with Part 4 */}
            {/* ================= RÉSUMÉ ================= */}

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <h2 className="mb-5 text-lg font-semibold">
                Résumé
              </h2>

              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-ink-soft">Slug</span>

                  <span className="font-medium">
                    {form.slug || "--"}
                  </span>
                </div>

                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    Couleur
                  </span>

                  <div className="flex items-center gap-2">

                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor: form.color,
                      }}
                    />

                    <span>{form.color}</span>

                  </div>

                </div>

                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    Icône
                  </span>

                  <span>
                    {form.icon || "--"}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    SEO
                  </span>

                  <span>
                    {form.seoTitle
                      ? "Configuré"
                      : "Non configuré"}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-ink-soft">
                    Mise en avant
                  </span>

                  <span>
                    {form.featured ? "Oui" : "Non"}
                  </span>

                </div>

              </div>

            </section>

          </aside>

        </div>

        {/* ================= FOOTER ================= */}

        <div className="card-surface flex flex-col gap-4 rounded-2xl p-6 shadow-card md:flex-row md:items-center md:justify-between">

          <div>

            <h3 className="text-lg font-semibold">
              Prêt à enregistrer ?
            </h3>

            <p className="text-sm text-ink-soft">
              Vérifiez les informations avant de créer cette catégorie.
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Annuler
            </Button>

            <Button type="submit">
              {loading
                ? "Enregistrement..."
                : form.status === "active"
                  ? "Enregistrer la catégorie"
                  : "Créer comme masquée"}
            </Button>

          </div>

        </div>

      </form>

    </>
  );
}
