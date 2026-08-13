"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  Sparkles,
  Lock,
  Loader2,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  type?: "article" | "video" | "resource" | string;
}

interface Course {
  id: string;
  slug?: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  duration?: string;
  coverUrl?: string;
  lessons?: Lesson[];
  articles?: Lesson[];
  videos?: Lesson[];
  resources?: Lesson[];
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] =
    useState<Course | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /*
   * ============================================================
   * CHECK LOCAL PAYMENT
   * ============================================================
   */

  useEffect(() => {
    if (!courseId) {
      return;
    }

    const paid =
      localStorage.getItem(
        `course_payment_${courseId}`
      ) === "true";

    /*
     * NOT PAID
     * → send to payment page
     */

    if (!paid) {
      router.replace(
        `/dashboard/courses/${courseId}/payment`
      );

      return;
    }

    setHasAccess(true);
  }, [courseId, router]);

  /*
   * ============================================================
   * LOAD COURSE FROM BACKEND
   * ============================================================
   *
   * Backend is used ONLY for course content.
   *
   * No enrollment.
   * No payment.
   * No payment validation.
   */

  useEffect(() => {
    if (!courseId || !hasAccess) {
      return;
    }

    async function fetchCourse() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(
          `${API_URL}/courses/${courseId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error(
            `Erreur ${res.status}: Impossible de charger la formation.`
          );
        }

        const json = await res.json();

        const data = (json.data ||
          json) as Course;

        setCourse(data);
      } catch (err) {
        console.error(
          "Erreur de chargement du cours:",
          err
        );

        setError(
          "Impossible de charger le contenu de cette formation."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, hasAccess]);

  /*
   * ============================================================
   * NORMALIZE LESSONS
   * ============================================================
   */

  const lessons = useMemo(() => {
    if (!course) {
      return [];
    }

    /*
     * If backend already returns lessons.
     */
    if (
      Array.isArray(course.lessons) &&
      course.lessons.length > 0
    ) {
      return course.lessons;
    }

    /*
     * Otherwise support separate content arrays.
     */
    return [
      ...(course.articles || []).map(
        (item) => ({
          ...item,
          type: "article" as const,
        })
      ),

      ...(course.videos || []).map(
        (item) => ({
          ...item,
          type: "video" as const,
        })
      ),

      ...(course.resources || []).map(
        (item) => ({
          ...item,
          type: "resource" as const,
        })
      ),
    ];
  }, [course]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading || !hasAccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2
          size={32}
          className="animate-spin text-[#e0156a]"
        />

        <p className="font-body text-sm text-[#7a1352]/70">
          Chargement de votre formation...
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */

  if (error || !course) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/dashboard/courses"
          className="mb-6 inline-flex items-center gap-2 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
        >
          <ArrowLeft size={16} />
          Retour aux formations
        </Link>

        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe3ee]">
            <BookOpen
              size={28}
              className="text-[#e0156a]"
            />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#1e1620]">
            Formation introuvable
          </h1>

          <p className="mt-2 font-body text-sm text-[#1e1620]/55">
            {error ||
              "Cette formation n'existe pas ou n'est plus disponible."}
          </p>

          <Link
            href="/dashboard/courses"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-6 py-3 font-body text-sm font-semibold text-white hover:brightness-105"
          >
            Voir les formations
          </Link>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * COURSE
   * ============================================================
   */

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/dashboard/courses"
        className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-[#e0156a] hover:text-[#7a1352]"
      >
        <ArrowLeft size={15} />
        Retour aux formations
      </Link>

      {/* HERO */}
      <section className="card-surface mb-8 overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#e0156a] via-[#c4136a] to-[#7a1352] px-7 py-10 md:px-10">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {course.category && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-body text-xs font-semibold text-white backdrop-blur">
                  <Sparkles size={12} />
                  {course.category}
                </span>
              )}

              {course.level && (
                <span className="rounded-full bg-white/15 px-3 py-1.5 font-body text-xs font-semibold text-white backdrop-blur">
                  {course.level}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9f9ef]/20 px-3 py-1.5 font-body text-xs font-semibold text-white">
                <CheckCircle2 size={12} />
                Accès acquis
              </span>
            </div>

            <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight text-white md:text-4xl">
              {course.title}
            </h1>

            {course.description && (
              <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-white/80 md:text-base">
                {course.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-5 font-body text-sm text-white/85">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>
                  {lessons.length} leçons
                </span>
              </div>

              {course.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-5">
            <span className="font-script text-lg text-[#e0156a]">
              Votre parcours
            </span>

            <h2 className="font-display text-2xl font-bold text-[#1e1620]">
              Contenu de la formation
            </h2>

            <p className="mt-1 font-body text-sm text-[#1e1620]/55">
              Progressez à votre rythme et découvrez
              chaque leçon.
            </p>
          </div>

          {lessons.length === 0 ? (
            <div className="card-surface p-10 text-center">
              <BookOpen
                size={30}
                className="mx-auto mb-3 text-[#e0156a]"
              />

              <p className="font-body text-sm text-[#1e1620]/55">
                Le contenu de cette formation sera
                bientôt disponible.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => {
                const Icon =
                  lesson.type === "video"
                    ? PlayCircle
                    : lesson.type === "resource"
                      ? FileText
                      : BookOpen;

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      router.push(
                        `/dashboard/courses/${course.id}/lesson/${lesson.id}`
                      );
                    }}
                    className="group card-surface w-full p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_-15px_rgba(224,21,106,0.25)] md:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffe3ee] font-display font-bold text-[#e0156a]">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#f1e9de] bg-[#fdfbf8] text-[#7a1352] sm:flex">
                        <Icon size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-sm font-bold text-[#1e1620] transition-colors group-hover:text-[#e0156a] md:text-base">
                            {lesson.title}
                          </h3>

                          {lesson.type ===
                            "video" && (
                            <span className="rounded-full bg-[#ffe3ee] px-2 py-0.5 font-body text-[10px] font-semibold text-[#7a1352]">
                              Vidéo
                            </span>
                          )}

                          {lesson.type ===
                            "resource" && (
                            <span className="rounded-full bg-[#f6efe1] px-2 py-0.5 font-body text-[10px] font-semibold text-[#8a6d1f]">
                              Ressource
                            </span>
                          )}
                        </div>

                        {lesson.description && (
                          <p className="mt-1 line-clamp-2 font-body text-xs text-[#1e1620]/50 md:text-sm">
                            {lesson.description}
                          </p>
                        )}

                        {lesson.duration && (
                          <div className="mt-2 flex items-center gap-1.5 font-body text-[11px] text-[#1e1620]/40">
                            <Clock size={12} />
                            {lesson.duration}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside>
          <div className="card-surface sticky top-6 p-6">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe3ee]">
                <BookOpen
                  size={19}
                  className="text-[#e0156a]"
                />
              </div>

              <div>
                <h3 className="font-display text-base font-bold text-[#1e1620]">
                  Votre formation
                </h3>

                <p className="font-body text-xs text-[#1e1620]/45">
                  Accès disponible
                </p>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#86cfa5] bg-[#e9f9ef] p-3">
              <CheckCircle2
                size={18}
                className="shrink-0 text-[#176b3a]"
              />

              <div>
                <p className="font-body text-xs font-bold text-[#176b3a]">
                  Formation accessible
                </p>

                <p className="mt-0.5 font-body text-[10px] text-[#176b3a]/70">
                  Votre accès est enregistré sur cet
                  appareil.
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#f1e9de] pt-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-[#1e1620]/55">
                  Leçons
                </span>

                <span className="font-body text-sm font-semibold text-[#1e1620]">
                  {lessons.length}
                </span>
              </div>

              {course.duration && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#1e1620]/55">
                    Durée
                  </span>

                  <span className="font-body text-sm font-semibold text-[#1e1620]">
                    {course.duration}
                  </span>
                </div>
              )}

              {course.level && (
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm text-[#1e1620]/55">
                    Niveau
                  </span>

                  <span className="font-body text-sm font-semibold text-[#7a1352]">
                    {course.level}
                  </span>
                </div>
              )}
            </div>

            {lessons.length > 0 && (
              <Link
                href={`/dashboard/courses/${course.id}/lesson/${lessons[0].id}`}
                className="group/btn relative mt-6 block w-full overflow-hidden rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] py-3 text-center font-body text-sm font-semibold text-white transition-all hover:brightness-105 hover:shadow-[0_10px_25px_-8px_rgba(224,21,106,0.55)]"
              >
                <span className="relative z-10">
                  Commencer la formation
                </span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
              </Link>
            )}

            <p className="mt-4 text-center font-body text-[10px] leading-relaxed text-[#1e1620]/35">
              Vous avez accès à cette formation
              depuis cet appareil.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}