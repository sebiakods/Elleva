"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  Clock3,
  Eye,
  GraduationCap,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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

type ApiResponse = {
  data?: unknown;
  courses?: unknown;
  message?: string;
};

import { API_BASE_URL as API_URL } from "@/services/api";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isCourse(value: unknown): value is Course {
  if (!value || typeof value !== "object") {
    return false;
  }

  const course = value as Record<string, unknown>;

  return (
    typeof course.id === "string" &&
    typeof course.title === "string"
  );
}

function normalizeCourses(data: unknown): Course[] {
  if (Array.isArray(data)) {
    return data.filter(isCourse);
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const response = data as ApiResponse;

  if (Array.isArray(response.data)) {
    return response.data.filter(isCourse);
  }

  if (Array.isArray(response.courses)) {
    return response.courses.filter(isCourse);
  }

  return [];
}

async function readApiResponse(
  response: Response
): Promise<ApiResponse | null> {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return (await response.json()) as ApiResponse;
  } catch {
    return null;
  }
}

function getErrorMessage(
  data: ApiResponse | null,
  fallback: string
): string {
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "—";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  return remaining > 0
    ? `${hours} h ${remaining} min`
    : `${hours} h`;
}

function normalizeSearchValue(
  value: string | null | undefined
): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ExpertCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  const setMenuRef = useCallback((node: HTMLDivElement | null) => {
    menuRef.current = node;
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Load courses                                                           */
  /* ---------------------------------------------------------------------- */

  const loadCourses = useCallback(async () => {
    const controller = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/courses/expert`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            response.status === 401 || response.status === 403
              ? "Votre session a expiré. Veuillez vous reconnecter."
              : "Impossible de récupérer les cours."
          )
        );
      }

      const coursesData = normalizeCourses(data);

      setCourses(coursesData);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      console.error("Error loading expert courses:", err);

      setCourses([]);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de récupérer les cours."
      );
    } finally {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/courses/expert`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage(
              data,
              response.status === 401 || response.status === 403
                ? "Votre session a expiré. Veuillez vous reconnecter."
                : "Impossible de récupérer les cours."
            )
          );
        }

        const coursesData = normalizeCourses(data);

        if (!cancelled) {
          setCourses(coursesData);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Error loading expert courses:", err);

        setCourses([]);

        setError(
          err instanceof Error
            ? err.message
            : "Impossible de récupérer les cours."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Delete course                                                          */
  /* ---------------------------------------------------------------------- */

  const deleteCourse = useCallback(async (courseId: string) => {
    if (!courseId) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce cours ?\n\nCette action est irréversible."
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      setError(null);

      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            response.status === 401 || response.status === 403
              ? "Votre session a expiré. Veuillez vous reconnecter."
              : "Impossible de supprimer le cours."
          )
        );
      }

      setCourses((currentCourses) =>
        currentCourses.filter((course) => course.id !== courseId)
      );

      setOpenMenu(null);
    } catch (err) {
      console.error("Error deleting course:", err);

      window.alert(
        err instanceof Error
          ? err.message
          : "Impossible de supprimer le cours."
      );
    } finally {
      setDeletingCourseId(null);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Close menu on outside click                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Search                                                                 */
  /* ---------------------------------------------------------------------- */

  const filteredCourses = useMemo(() => {
    const query = normalizeSearchValue(search);

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const title = normalizeSearchValue(course.title);
      const category = normalizeSearchValue(course.category);
      const level = normalizeSearchValue(course.level);
      const description = normalizeSearchValue(course.description);

      return (
        title.includes(query) ||
        category.includes(query) ||
        level.includes(query) ||
        description.includes(query)
      );
    });
  }, [courses, search]);

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                             */
  /* ---------------------------------------------------------------------- */

  const publishedCourses = useMemo(
    () => courses.filter((course) => course.isPublished).length,
    [courses]
  );

  const totalStudents = useMemo(
    () =>
      courses.reduce(
        (total, course) =>
          total + Number(course.enrolledCount || 0),
        0
      ),
    [courses]
  );

  const averageRating = useMemo(() => {
    if (courses.length === 0) {
      return "0.0";
    }

    const totalRating = courses.reduce(
      (total, course) => total + Number(course.rating || 0),
      0
    );

    return (totalRating / courses.length).toFixed(1);
  }, [courses]);

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumb */}
        <div className="mb-8 text-sm text-ink-soft">
          <span>Espace Experte</span>
          <span className="mx-2 text-ink-soft/40">/</span>
          <span className="font-medium text-wine-700">
            Cours
          </span>
        </div>

        {/* Header */}
        <div className="relative mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
          />

          <div className="animate-rise">
            <p className="font-script text-2xl leading-none text-rose-500">
              Bonjour,
            </p>

            <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
              Mes{" "}
              <span className="text-gradient-rise">
                cours
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
              Créez et gérez vos cours depuis votre espace
              experte. Vous pourrez ensuite construire le contenu
              de chaque cours.
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
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher un cours..."
              aria-label="Rechercher un cours"
              className="focus-ring w-full rounded-xl border border-sand-200 bg-sand-50 py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="space-y-6"
            aria-busy="true"
            aria-live="polite"
            aria-label="Chargement des cours"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={`stat-skeleton-${index}`}
                    className="card-surface space-y-3 p-5"
                  >
                    <Shimmer className="h-11 w-11 rounded-xl" />
                    <Shimmer className="h-3 w-20" />
                    <Shimmer className="h-6 w-14" />
                  </div>
                )
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <div
                    key={`course-skeleton-${index}`}
                    className="card-surface overflow-hidden"
                  >
                    <Shimmer className="h-44 rounded-none" />

                    <div className="space-y-3 p-5">
                      <Shimmer className="h-3 w-24" />
                      <Shimmer className="h-5 w-3/4" />
                      <Shimmer className="h-4 w-full" />
                      <Shimmer className="h-4 w-5/6" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-xl2 border border-sand-200 bg-white px-6 py-14 text-center shadow-card"
          >
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
              onClick={() => {
                setError(null);
                void loadCourses();
              }}
              className="focus-ring mt-6 rounded-xl bg-wine-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-wine-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredCourses.length === 0 && (
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
        {!loading &&
          !error &&
          filteredCourses.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  deletingCourseId={deletingCourseId}
                  onDelete={deleteCourse}
                  delay={Math.min(index, 6) * 60}
                  setMenuRef={setMenuRef}
                />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Shimmer                                                                    */
/* -------------------------------------------------------------------------- */

function Shimmer({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
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
  icon: ReactNode;
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
  deletingCourseId,
  onDelete,
  delay = 0,
  setMenuRef,
}: {
  course: Course;
  openMenu: string | null;
  setOpenMenu: (id: string | null) => void;
  deletingCourseId: string | null;
  onDelete: (id: string) => void;
  delay?: number;

  /*
   * Callback ref:
   * This avoids the React 19 RefObject<HTMLDivElement | null>
   * vs RefObject<HTMLDivElement> incompatibility.
   */
  setMenuRef: (node: HTMLDivElement | null) => void;
}) {
  const isDeleting = deletingCourseId === course.id;

  const title = course.title?.trim() || "Cours sans titre";
  const category = course.category?.trim() || "Non classé";
  const level = course.level?.trim() || "Tous niveaux";

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
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-rise-gradient-soft">
            <div
              aria-hidden="true"
              className="absolute -left-8 -top-10 h-36 w-36 rounded-full bg-rose-300/40 blur-2xl transition-transform duration-500 group-hover:scale-110"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-12 -right-6 h-40 w-40 rounded-full bg-gold-400/25 blur-2xl transition-transform duration-500 group-hover:scale-110"
            />

            <span
              aria-hidden="true"
              className="font-script select-none text-8xl leading-none text-wine-500/25"
            >
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Inset frame */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-lg border border-white/50"
        />

        {/* Hover overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-wine-900/35 via-wine-900/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />

        {/* Course type */}
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
        <div
          ref={
            openMenu === course.id
              ? setMenuRef
              : undefined
          }
          className="absolute right-3 top-3"
        >
          <button
            type="button"
            disabled={isDeleting}
            onClick={() =>
              setOpenMenu(
                openMenu === course.id
                  ? null
                  : course.id
              )
            }
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-ink-soft shadow-sm backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Options du cours ${title}`}
            aria-haspopup="menu"
            aria-expanded={openMenu === course.id}
          >
            <MoreVertical size={18} />
          </button>

          {openMenu === course.id && (
            <div
              role="menu"
              className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-sand-200 bg-white py-1 shadow-lg"
            >
              <Link
                href={`/expert/courses/${course.id}`}
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-sand-50"
                onClick={() => setOpenMenu(null)}
              >
                <Eye size={16} />
                Ouvrir
              </Link>

              <Link
                href={`/expert/courses/${course.id}/edit`}
                role="menuitem"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-sand-50"
                onClick={() => setOpenMenu(null)}
              >
                <Pencil size={16} />
                Modifier
              </Link>

              <button
                type="button"
                role="menuitem"
                disabled={isDeleting}
                onClick={() => {
                  void onDelete(course.id);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isDeleting
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Category / Level */}
        <div className="mb-3 flex items-center gap-2 text-xs text-ink-soft">
          <span className="max-w-[55%] truncate rounded-full bg-wine-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-wine-600">
            {category}
          </span>

          <span className="text-ink-soft/40">
            •
          </span>

          <span className="truncate">
            {level}
          </span>
        </div>

        {/* Title */}
        <h2 className="line-clamp-2 min-h-[52px] font-display text-lg font-semibold text-wine-900">
          {title}
        </h2>

        {/* Description */}
        <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-5 text-ink-soft">
          {course.description?.trim() ||
            "Aucune description."}
        </p>

        {/* Metadata */}
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-sand-100 pt-4">
          <MetaItem
            icon={<Clock3 size={15} />}
            value={formatDuration(
              Number(course.durationMinutes || 0)
            )}
          />

          <MetaItem
            icon={<Users size={15} />}
            value={`${Number(
              course.enrolledCount || 0
            )} inscrites`}
          />

          <MetaItem
            icon={<BookOpen size={15} />}
            value={`${Number(
              course.lessonCount || 0
            )} leçons`}
          />

          <MetaItem
            icon={
              <Star
                size={15}
                fill="currentColor"
              />
            }
            value={Number(
              course.rating || 0
            ).toFixed(1)}
            tone="gold"
          />
        </div>

        {/* Open */}
        <Link
          href={`/expert/courses/${course.id}`}
          className="focus-ring mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-wine-300 px-4 py-2.5 text-sm font-semibold text-wine-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-wine-50 active:scale-[0.98]"
        >
          Gérer le cours
          <span aria-hidden="true">
            →
          </span>
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
  icon: ReactNode;
  value: string;
  tone?: "default" | "gold";
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span
        className={
          tone === "gold"
            ? "text-gold-500"
            : "text-wine-700"
        }
      >
        {icon}
      </span>

      <span
        className={
          tone === "gold"
            ? "font-medium text-ink"
            : ""
        }
      >
        {value}
      </span>
    </div>
  );
}
