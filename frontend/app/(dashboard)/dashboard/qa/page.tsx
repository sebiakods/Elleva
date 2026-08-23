"use client";
import { useEffect, useState } from "react";
import { HelpCircle, Plus, Clock, CheckCircle2, Sparkle, Heart, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { askQuestion, listMyQuestions, QAQuestion } from "@/lib/api/qa";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EntrepreneurQAPage() {
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    listMyQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setLoading(false));
  }

  async function submit() {
    setFormError(null);
    if (question.trim().length < 10) {
      setFormError("Votre question doit contenir au moins 10 caractères.");
      return;
    }
    if (!category.trim()) {
      setFormError("Merci de préciser une catégorie.");
      return;
    }
    setSubmitting(true);
    try {
      await askQuestion(question.trim(), category.trim());
      setQuestion("");
      setCategory("");
      setShowForm(false);
      load();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const pendingCount = questions.length - answeredCount;

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Entrepreneuse</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Questions & Réponses</span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div>
            <p className="font-script text-2xl leading-none text-rose-500">
              Vue d&apos;ensemble
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
                Questions & <span className="text-gradient-rise">réponses</span>
              </h1>

              {pendingCount > 0 && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                  {pendingCount} en attente
                </span>
              )}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Posez vos questions à nos expertes et retrouvez toutes leurs
              réponses au même endroit.
            </p>
          </div>

          <Button onClick={() => setShowForm((s) => !s)} className="shrink-0">
            <Plus size={16} /> Poser une question
          </Button>
        </div>

        {/* Ask form */}
        {showForm && (
          <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-rose-100/70 bg-white p-6 shadow-card">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rise-gradient-soft opacity-60 blur-2xl"
            />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="font-script text-lg leading-none text-rose-400">
                  Une question ?
                </p>
                <h2 className="mt-1.5 font-display text-lg font-semibold text-wine-900">
                  Nouvelle question
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-ink-soft transition hover:bg-sand-100"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="relative mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-wine-700">
                {formError}
              </div>
            )}

            <div className="relative mt-5 space-y-3">
              <input
                placeholder="Catégorie (ex: Financement, Finance, Juridique...)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-rose-100/70 bg-sand-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-400 focus:bg-white"
              />
              <textarea
                rows={4}
                placeholder="Votre question pour nos expertes…"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full resize-none rounded-xl border border-rose-100/70 bg-sand-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-rose-400 focus:bg-white"
              />
              <div className="flex gap-2 pt-1">
                <Button size="sm" onClick={() => !submitting && submit()}>
                  {submitting && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}
                  {submitting ? "Envoi..." : "Envoyer"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[2rem] border border-rose-100/60 bg-white/70"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-wine-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && questions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-rose-200 bg-white/60 px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-400">
              <HelpCircle size={22} />
            </div>
            <p className="font-script text-xl text-rose-500">
              Aucune question pour le moment
            </p>
            <p className="mt-2 max-w-sm text-sm text-ink-soft">
              Posez une question à nos expertes, vous recevrez une
              notification dès qu&apos;elle sera répondue.
            </p>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="mt-6">
                <Plus size={16} /> Poser ma première question
              </Button>
            )}
          </div>
        )}

        {/* Questions list */}
        {!loading && !error && questions.length > 0 && (
          <div className="space-y-5">
            {questions.map((q) => (
              <div
                key={q.id}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[2rem]
                  border
                  border-rose-100/70
                  bg-white
                  p-6
                  shadow-card
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-rose-200
                  hover:shadow-bloom
                "
              >
                {/* decorative corner bloom */}
                <div
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-28
                    w-28
                    rounded-full
                    bg-rise-gradient-soft
                    opacity-0
                    blur-2xl
                    transition-opacity
                    duration-500
                    group-hover:opacity-70
                  "
                />

                {/* floating heart accent */}
                <Heart
                  size={13}
                  className="
                    absolute
                    right-5
                    top-5
                    text-rose-200
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-y-0.5
                    group-hover:opacity-100
                  "
                  fill="currentColor"
                />

                <div className="relative">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge tone="rose">{q.category}</Badge>
                    {q.isAnswered ? (
                      <Badge tone="wine">
                        <CheckCircle2 size={11} className="mr-1" />
                        Répondu
                      </Badge>
                    ) : (
                      <Badge tone="gold">
                        <Clock size={11} className="mr-1" />
                        En attente
                      </Badge>
                    )}
                    <span className="text-xs text-ink-soft/60">
                      {formatDate(q.createdAt)}
                    </span>
                  </div>

                  <h3 className="mb-3 font-display text-base font-semibold leading-snug text-ink">
                    {q.question}
                  </h3>

                  {q.isAnswered && q.answer ? (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-sm text-ink-soft">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-600">
                        <Sparkle size={12} />
                        Réponse {q.answerer?.name ? `de ${q.answerer.name}` : "de nos expertes"}
                      </p>
                      {q.answer}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-sand-200 bg-sand-50 px-4 py-3 text-xs text-ink-soft">
                      <Clock size={13} className="text-gold-500" />
                      En attente d&apos;une réponse de nos expertes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
