"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";

type ArticleForm = {
  title: string;
  slug: string;
  category: string;
  readTimeMinutes: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
};

const categories = [
  "Business Plan",
  "Finance",
  "Marketing",
  "Leadership",
  "Financement",
  "Entrepreneuriat",
  "Innovation",
  "Management",
];

export default function NewArticlePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ArticleForm>({
    title: "",
    slug: "",
    category: "",
    readTimeMinutes: "",
    excerpt: "",
    content: "",
    status: "draft",
  });

  useEffect(() => {
    if (!form.title) return;

    const slug = form.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setForm((prev) => ({
      ...prev,
      slug,
    }));
  }, [form.title]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const wordCount = useMemo(() => {
    return form.content
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [form.content]);

  const readingEstimate = useMemo(() => {
    if (!wordCount) return "0 min";
    return `${Math.max(1, Math.ceil(wordCount / 200))} min`;
  }, [wordCount]);

  const completion = useMemo(() => {
    let score = 0;

    if (form.title) score += 20;
    if (form.slug) score += 15;
    if (form.category) score += 15;
    if (form.excerpt) score += 20;
    if (form.content) score += 30;

    return score;
  }, [form]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const body = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        readTimeMinutes:
          Number(form.readTimeMinutes) ||
          Math.max(1, Math.ceil(wordCount / 200)),
        isPublished: form.status === "published",
      };

      console.log(body);


      alert("Article enregistré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Nouvel article" />

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-7xl space-y-8"
      >
        <div className="grid gap-8 lg:grid-cols-[2fr_380px]">

          {/* ================= LEFT COLUMN ================= */}

          <div className="space-y-6">

            <section className="card-surface rounded-2xl p-6 shadow-card">
              <h2 className="mb-6 text-xl font-semibold">
                Informations principales
              </h2>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Titre
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Titre de votre article..."
                    className="w-full rounded-xl border p-3 outline-none transition focus:border-primary"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">

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
                      Catégorie
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border p-3"
                    >
                      <option value="">Choisir...</option>

                      {categories.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Temps de lecture (minutes)
                  </label>

                  <input
                    type="number"
                    min={1}
                    name="readTimeMinutes"
                    value={form.readTimeMinutes}
                    onChange={handleChange}
                    placeholder={readingEstimate}
                    className="w-full rounded-xl border p-3"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Laissez vide pour calculer automatiquement.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Résumé
                  </label>

                  <textarea
                    rows={5}
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    placeholder="Résumé affiché sur la liste des articles..."
                    className="w-full rounded-xl border p-3"
                  />
                </div>

              </div>
            </section>

            <section className="card-surface rounded-2xl p-6 shadow-card">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Contenu de l'article
                </h2>

                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium">
                  {wordCount} mots
                </span>
              </div>

              <textarea
                rows={18}
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Commencez à écrire votre article..."
                className="min-h-[500px] w-full rounded-xl border p-4 leading-7"
              />

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
                    <option value="draft">
                      Brouillon
                    </option>

                    <option value="published">
                      Publier immédiatement
                    </option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                >
                  {loading
                    ? "Publication..."
                    : form.status === "published"
                    ? "Publier l'article"
                    : "Enregistrer le brouillon"}
                </Button>

              </div>
            </section>

            <section className="card-surface rounded-2xl p-6 shadow-card">
              <h2 className="mb-6 text-lg font-semibold">
                Progression
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between text-sm">
                  <span>Complétion</span>
                  <span className="font-semibold">
                    {completion}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span>Titre</span>
                    <span>{form.title ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Slug</span>
                    <span>{form.slug ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Catégorie</span>
                    <span>{form.category ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Résumé</span>
                    <span>{form.excerpt ? "✅" : "❌"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Contenu</span>
                    <span>{form.content ? "✅" : "❌"}</span>
                  </div>

                </div>
              </div>
            </section>

            <section className="card-surface rounded-2xl p-6 shadow-card">
              <h2 className="mb-6 text-lg font-semibold">
                Aperçu rapide
              </h2>

              <div className="rounded-xl border p-4">

                <h3 className="line-clamp-2 font-semibold">
                  {form.title || "Titre de l'article"}
                </h3>

                <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                  {form.excerpt ||
                    "Le résumé apparaîtra ici."}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {form.category || "Catégorie"}
                  </span>

                  <span>
                    {form.readTimeMinutes
                      ? `${form.readTimeMinutes} min`
                      : readingEstimate}
                  </span>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="line-clamp-6 text-sm leading-6 text-gray-700">
                    {form.content ||
                      "Le contenu de l'article apparaîtra ici."}
                  </p>
                </div>

              </div>
            </section>

          </aside>

        </div>

        <div className="card-surface flex flex-col gap-4 rounded-2xl p-6 shadow-card md:flex-row md:items-center md:justify-between">

          <div>
            <h3 className="text-lg font-semibold">
              Prêt à publier ?
            </h3>

            <p className="text-sm text-gray-500">
              Vérifiez les informations de votre article avant de le publier.
            </p>
          </div>

          <div className="flex gap-3">

            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Annuler
            </Button>

            <Button type="submit">
              {loading
                ? "Publication..."
                : form.status === "published"
                ? "Publier l'article"
                : "Enregistrer le brouillon"}
            </Button>

          </div>

        </div>

      </form>
    </>
  );
}
