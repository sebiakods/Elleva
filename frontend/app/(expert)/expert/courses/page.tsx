"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  GraduationCap,
  BookOpen,
  Clock3,
  Users,
  Star,
  MoreVertical,
  Pencil,
  Eye,
  Trash2,
  Search,
  AlertCircle,
} from "lucide-react";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  durationMinutes: number;
  lessonCount: number;
  enrolledCount: number;
  rating: number;
  coverUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function ExpertCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("Vous devez être connectée pour voir vos cours.");
        return;
      }

      const response = await fetch(`${API_URL}/courses/expert`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Impossible de récupérer les cours."
        );
      }

      const coursesData: Course[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.courses)
        ? data.courses
        : [];

      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading expert courses:", error);

      setCourses([]);

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de récupérer les cours."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(courseId: string) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce cours ?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message || "Impossible de supprimer le cours."
        );
      }

      setCourses((current) =>
        current.filter((course) => course.id !== courseId)
      );

      setOpenMenu(null);
    } catch (error) {
      console.error("Error deleting course:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le cours."
      );
    }
  }

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      course.title.toLowerCase().includes(query) ||
      course.category.toLowerCase().includes(query) ||
      course.level.toLowerCase().includes(query)
    );
  });

  const publishedCourses = courses.filter(
    (course) => course.isPublished
  ).length;

  const totalStudents = courses.reduce(
    (total, course) => total + (course.enrolledCount || 0),
    0
  );

  const averageRating =
    courses.length > 0
      ? (
          courses.reduce(
            (total, course) => total + (course.rating || 0),
            0
          ) / courses.length
        ).toFixed(1)
      : "0.0";

  function formatDuration(minutes: number) {
    if (!minutes) return "—";

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;

    return remaining > 0 ? `${hours} h ${remaining} min` : `${hours} h`;
  }

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">Cours</span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {/* signature ambient accent — the one deliberate flourish on the page */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div className="animate-rise">
            <p className="font-script text-2xl leading-none text-rose-500">
              Bonjour,
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Mes <span className="text-gradient-rise">cours</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Créez et gérez vos cours depuis votre espace experte. Vous
              pourrez ensuite construire le contenu de chaque cours.
            </p>
          </div>

          <Link
            href="/expert/courses/create"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-semibold text-white shadow-bloom transition duration-300 hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Créer un cours
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<GraduationCap size={20} />}
            label="Total des cours"
            value={courses.length}
            delay={0}
          />
          <StatCard
            icon={<BookOpen size={20} />}
            label="Cours publiés"
            value={publishedCourses}
            delay={70}
          />
          <StatCard
            icon={<Users size={20} />}
            label="Apprenantes"
            value={totalStudents}
            delay={140}
          />
          <StatCard
            icon={<Star size={20} />}
            label="Note moyenne"
            value={averageRating}
            tone="gold"
            delay={210}
          />
        </div>

        {/* Search */}
        <div className="card-surface mb-6 p-4 shadow-card">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-rose-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un cours..."
              className="focus-ring w-full rounded-xl border border-sand-200 bg-sand-50 py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-6" aria-busy="true" aria-live="polite">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-surface space-y-3 p-5">
                  <Shimmer className="h-11 w-11 rounded-xl" />
                  <Shimmer className="h-3 w-20" />
                  <Shimmer className="h-6 w-14" />
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-surface overflow-hidden">
                  <Shimmer className="h-44 rounded-none" />
                  <div className="space-y-3 p-5">
                    <Shimmer className="h-3 w-24" />
                    <Shimmer className="h-5 w-3/4" />
                    <Shimmer className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl2 border border-sand-200 bg-white px-6 py-14 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertCircle size={26} />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-900">
              Impossible de charger vos cours
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
              {error}
            </p>

            <button
              type="button"
              onClick={loadCourses}
              className="focus-ring mt-6 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-wine-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="rounded-xl2 border-2 border-dashed border-sand-200 bg-white px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 animate-float items-center justify-center rounded-2xl bg-rise-gradient-soft text-wine-700">
              <GraduationCap size={30} />
            </div>

            <h2 className="font-display text-xl font-semibold text-wine-900">
              {search
                ? "Aucun cours trouvé"
                : "Vous n'avez pas encore créé de cours"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
              {search
                ? "Essayez avec un autre terme de recherche."
                : "Créez votre premier cours et commencez à accueillir des apprenantes."}
            </p>

            {!search && (
              <Link
                href="/expert/courses/create"
                className="focus-ring mt-6 inline-flex items-center gap-2 rounded-xl bg-rise-gradient px-5 py-3 text-sm font-semibold text-white shadow-bloom transition hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Créer mon premier cours
              </Link>
            )}
          </div>
        )}

        {/* Courses */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                formatDuration={formatDuration}
                onDelete={deleteCourse}
                delay={Math.min(index, 6) * 60}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Shimmer (loading skeleton block)                                          */
/* -------------------------------------------------------------------------- */

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg bg-gradient-to-r from-sand-100 via-sand-50 to-sand-100 bg-[length:200%_100%] ${className}`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  tone = "default",
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: "default" | "gold";
  delay?: number;
}) {
  return (
    <div
      className="card-surface animate-rise p-5 shadow-card transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:border-rose-200 hover:shadow-bloom"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === "gold"
            ? "bg-gold-400/15 text-gold-500"
            : "bg-rise-gradient-soft text-wine-700"
        }`}
      >
        {icon}
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft/70">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold text-wine-900">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Course Card                                                                */
/* -------------------------------------------------------------------------- */

function CourseCard({
  course,
  openMenu,
  setOpenMenu,
  formatDuration,
  onDelete,
  delay = 0,
}: {
  course: Course;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  formatDuration: (minutes: number) => string;
  onDelete: (id: string) => void;
  delay?: number;
}) {
  return (
    <article
      className="card-surface group animate-rise overflow-hidden shadow-card transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-rose-200 hover:shadow-bloom active:scale-[0.99] active:duration-100"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Cover */}
      <div className="relative h-48 overflow-hidden">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-rise-gradient-soft">
            {/* soft color blooms, palette-only */}
            <div
              aria-hidden
              className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-rose-300/40 blur-2xl transition-transform duration-500 group-hover:scale-110"
            />
            <div
              aria-hidden
              className="absolute -bottom-12 -right-6 h-40 w-40 rounded-full bg-gold-400/25 blur-2xl transition-transform duration-500 group-hover:scale-110"
            />

            {/* script monogram watermark */}
            <span
              aria-hidden
              className="font-script select-none text-8xl leading-none text-wine-500/25"
            >
              {course.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* thin gold-lit inset frame, ties every cover to the brand */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-3 rounded-lg border border-white/50"
        />

        {/* rose → wine wash that appears on hover, palette-only */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-900/35 via-wine-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* course type badge, bottom-left */}
        <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-wine-700 shadow-sm backdrop-blur transition-transform duration-300 group-hover:scale-105">
          <GraduationCap size={16} />
        </div>

        {/* Status */}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
              course.isPublished
                ? "bg-gold-400 text-white"
                : "bg-white/90 text-ink-soft"
            }`}
          >
            {course.isPublished ? "Publié" : "Brouillon"}
          </span>
        </div>

        {/* Menu */}
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={() =>
              setOpenMenu(openMenu === course.id ? null : course.id)
            }
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-ink-soft shadow-sm backdrop-blur transition hover:bg-white"
            aria-label="Options du cours"
          >
            <MoreVertical size={18} />
          </button>

          {openMenu === course.id && (
            <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-lg">
              <Link
                href={`/expert/courses/${course.id}`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-sand-50"
                onClick={() => setOpenMenu(null)}
              >
                <Eye size={16} />
                Ouvrir
              </Link>

              <Link
                href={`/expert/courses/${course.id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-sand-50"
                onClick={() => setOpenMenu(null)}
              >
                <Pencil size={16} />
                Modifier
              </Link>

              <button
                type="button"
                onClick={() => onDelete(course.id)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Category / Level */}
        <div className="mb-3 flex items-center gap-2 text-xs text-ink-soft">
          <span className="rounded-full bg-wine-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-wine-600">
            {course.category}
          </span>
          <span className="text-ink-soft/40">•</span>
          <span>{course.level}</span>
        </div>

        {/* Title */}
        <h2 className="line-clamp-2 min-h-[52px] font-display text-lg font-semibold text-wine-900">
          {course.title}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-5 text-ink-soft">
          {course.description || "Aucune description."}
        </p>

        {/* Metadata */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-sand-100 pt-4">
          <MetaItem
            icon={<Clock3 size={15} />}
            value={formatDuration(course.durationMinutes)}
          />
          <MetaItem
            icon={<Users size={15} />}
            value={`${course.enrolledCount || 0} inscrites`}
          />
          <MetaItem
            icon={<BookOpen size={15} />}
            value={`${course.lessonCount || 0} leçons`}
          />
          <MetaItem
            icon={<Star size={15} fill="currentColor" />}
            value={(course.rating || 0).toFixed(1)}
            tone="gold"
          />
        </div>

        {/* Open */}
        <Link
          href={`/expert/courses/${course.id}`}
          className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-wine-300 px-4 py-2.5 text-sm font-semibold text-wine-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-wine-50 active:scale-[0.98]"
        >
          Gérer le cours
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

function MetaItem({
  icon,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  value: string;
  tone?: "default" | "gold";
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className={tone === "gold" ? "text-gold-500" : "text-wine-700"}>
        {icon}
      </span>
      <span className={tone === "gold" ? "font-medium text-ink" : ""}>
        {value}
      </span>
    </div>
  );
}