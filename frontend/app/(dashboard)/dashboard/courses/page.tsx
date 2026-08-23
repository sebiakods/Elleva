"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Loader2,
  PlayCircle,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

const API_URL = '/api';

type Course = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  level?: string | null;
  duration?: number | null;
  price?: number | null;
  studentsCount?: number | null;
  _count?: {
    enrollments?: number;
    videos?: number;
    articles?: number;
  };
  expert?: {
    id?: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        // IMPORTANT:
        // No localStorage
        // No accessToken
        // No Authorization header
        const response = await fetch(`${API_URL}/courses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Impossible de charger les cours (${response.status})`
          );
        }

        const data = await response.json();

        // Supports:
        // { courses: [...] }
        // { data: [...] }
        // [...]
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.courses)
          ? data.courses
          : Array.isArray(data?.data)
          ? data.data
          : [];

        if (!cancelled) {
          setCourses(list);
        }
      } catch (err) {
        console.error("Error loading courses:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Une erreur est survenue lors du chargement des cours."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return courses;

    return courses.filter((course) => {
      return (
        course.title?.toLowerCase().includes(value) ||
        course.description?.toLowerCase().includes(value) ||
        course.category?.toLowerCase().includes(value) ||
        course.level?.toLowerCase().includes(value)
      );
    });
  }, [courses, search]);

  const getExpertName = (course: Course) => {
    if (!course.expert) return "Expert";

    if (course.expert.firstName || course.expert.lastName) {
      return `${course.expert.firstName || ""} ${
        course.expert.lastName || ""
      }`.trim();
    }

    return course.expert.name || "Expert";
  };

  const getStudentsCount = (course: Course) => {
    return course.studentsCount ?? course._count?.enrollments ?? 0;
  };

  const getCourseImage = (course: Course) => {
    return course.thumbnail || course.imageUrl || null;
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <div className="h-4 w-40 animate-pulse rounded-full bg-[#ffe3ee]" />
          <div className="mt-3 h-8 w-64 animate-pulse rounded-lg bg-[#f6efe1]" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-[#f6efe1]" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="card-surface overflow-hidden p-0"
            >
              <div className="h-40 animate-pulse bg-gradient-to-br from-[#ffe3ee] to-[#f6efe1]" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[#f6efe1]" />
                <div className="h-3.5 w-full animate-pulse rounded bg-[#f6efe1]" />
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#f6efe1]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
     ============================================================ */

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="card-surface p-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ffe3ee] font-display text-xl font-bold text-[#e0156a]">
            !
          </div>

          <h2 className="font-display text-xl font-bold text-[#1e1620]">
            Impossible de charger les cours
          </h2>

          <p className="mt-2 font-body text-sm text-[#1e1620]/60">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] px-6 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            <Loader2 size={15} />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     PAGE
     ============================================================ */

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-script text-lg text-[#e0156a]">
            Développez vos compétences
          </span>

          <h1 className="font-display text-3xl font-bold text-[#1e1620]">
            Nos formations
          </h1>

          <p className="mt-2 max-w-2xl font-body text-sm text-[#1e1620]/55">
            Découvrez nos formations et progressez à votre rythme.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#e0156a]/50"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="w-full rounded-full border border-[#f1e9de] bg-[#fdfbf8] py-3 pl-10 pr-4 font-body text-sm text-[#1e1620] outline-none transition focus:border-[#e0156a]/40"
          />
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredCourses.length === 0 && (
        <div className="card-surface p-12 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffe3ee]">
            <BookOpen size={28} className="text-[#e0156a]" />
          </div>

          <h2 className="font-display text-xl font-bold text-[#1e1620]">
            {search ? "Aucune formation trouvée" : "Aucune formation disponible"}
          </h2>

          <p className="mt-2 font-body text-sm text-[#1e1620]/55">
            {search
              ? "Essayez avec un autre terme de recherche."
              : "Les formations apparaîtront ici dès qu'elles seront disponibles."}
          </p>
        </div>
      )}

      {/* COURSES GRID */}
      {filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => {
            const image = getCourseImage(course);
            const students = getStudentsCount(course);

            return (
              <Link
                key={course.id}
                href={`/dashboard/courses/${encodeURIComponent(course.id)}`}
                className="group card-surface overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-20px_rgba(224,21,106,0.35)]"
              >
                {/* IMAGE */}
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#e0156a] via-[#c4136a] to-[#7a1352]">
                  <div
                    aria-hidden
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10"
                  />

                  <div
                    aria-hidden
                    className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/10"
                  />

                  {image ? (
                    <img
                      src={image}
                      alt={course.title}
                      className="relative h-full w-full object-cover opacity-95 transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative flex h-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/60 bg-white/20 text-white backdrop-blur-sm">
                        <BookOpen size={28} strokeWidth={1.8} />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                  {course.category && (
                    <span className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/90 px-3 py-1 font-body text-[11px] font-semibold text-[#7a1352] backdrop-blur-sm">
                      {course.category}
                    </span>
                  )}

                  <div className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#e0156a] opacity-0 shadow-lg transition group-hover:opacity-100">
                    <PlayCircle size={22} />
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  {course.level && (
                    <span className="mb-2 inline-flex rounded-full bg-[#f6efe1] px-3 py-1 font-body text-[11px] font-semibold text-[#8a6d1f]">
                      {course.level}
                    </span>
                  )}

                  <h2 className="line-clamp-2 font-display text-base font-bold text-[#1e1620] transition-colors group-hover:text-[#e0156a]">
                    {course.title}
                  </h2>

                  {course.description && (
                    <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-[#1e1620]/55">
                      {course.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#f1e9de] pt-4 font-body text-xs text-[#1e1620]/50">
                    {course.duration != null && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {course.duration} min
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <Users size={13} />
                      {students} étudiant{students !== 1 ? "s" : ""}
                    </span>

                    <div className="ml-auto flex items-center gap-1 text-[#e0156a] opacity-0 transition-opacity group-hover:opacity-100">
                      <Sparkles size={12} />
                      <span className="font-semibold">Voir</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f1e9de] pt-4">
                    <div>
                      <p className="font-body text-[11px] text-[#1e1620]/40">
                        Formateur
                      </p>
                      <p className="mt-0.5 font-body text-sm font-semibold text-[#7a1352]">
                        {getExpertName(course)}
                      </p>
                    </div>

                    {course.price != null && (
                      <div className="text-right">
                        <p className="font-body text-[11px] text-[#1e1620]/40">
                          Prix
                        </p>
                        <p className="mt-0.5 font-display text-sm font-bold text-[#e0156a]">
                          {course.price === 0
                            ? "Gratuit"
                            : `${course.price.toLocaleString("fr-FR")} DA`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
