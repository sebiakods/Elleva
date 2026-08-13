"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  coverUrl?: string;
  price?: number;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

function isCoursePaid(courseId: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    localStorage.getItem(`course_payment_${courseId}`) === "true"
  );
}

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [paidCourses, setPaidCourses] = useState<
    Record<string, boolean>
  >({});

  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [selectedLevel, setSelectedLevel] =
    useState("all");

  /*
   * ============================================================
   * LOAD COURSES
   * ============================================================
   *
   * Backend is used ONLY to display course information.
   *
   * There is NO payment request here.
   */

  useEffect(() => {
    async function fetchCourses() {
      try {
        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken");

        const res = await fetch(`${API_URL}/courses`, {
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(
            `Erreur ${res.status}: Impossible de charger les formations.`
          );
        }

        const json = await res.json();

        const data: Course[] = Array.isArray(json)
          ? json
          : json.data || [];

        setCourses(data);

        /*
         * Read local payment state for every course.
         */
        const paymentState: Record<string, boolean> = {};

        data.forEach((course) => {
          paymentState[course.id] =
            isCoursePaid(course.id);
        });

        setPaidCourses(paymentState);
      } catch (err) {
        console.error(
          "Erreur de chargement des cours :",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  /*
   * ============================================================
   * HANDLE COURSE
   * ============================================================
   *
   * NOT PAID
   *     → Payment page
   *
   * PAID
   *     → Course page
   */

  const handleJoinCourse = (course: Course) => {
    const paid = isCoursePaid(course.id);

    /*
     * Keep the selected course available to the payment page.
     * This is NOT payment data.
     */
    if (!paid) {
      sessionStorage.setItem(
        "paymentCourse",
        JSON.stringify(course)
      );

      window.location.href =
        `/dashboard/courses/${course.id}/payment`;

      return;
    }

    /*
     * Already paid.
     */
    window.location.href =
      `/dashboard/courses/${course.id}`;
  };

  /*
   * ============================================================
   * FILTERS
   * ============================================================
   */

  const categories = useMemo(() => {
    const cats = courses
      .map((course) => course.category)
      .filter(
        (category): category is string =>
          Boolean(category)
      );

    return Array.from(new Set(cats));
  }, [courses]);

  const levels = useMemo(() => {
    const levels = courses
      .map((course) => course.level)
      .filter(
        (level): level is string => Boolean(level)
      );

    return Array.from(new Set(levels));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title
          .toLowerCase()
          .includes(query) ||
        course.description
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        selectedCategory === "all" ||
        course.category === selectedCategory;

      const matchesLevel =
        selectedLevel === "all" ||
        course.level === selectedLevel;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel
      );
    });
  }, [
    courses,
    searchQuery,
    selectedCategory,
    selectedLevel,
  ]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedLevel !== "all";

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#f1e9de] border-t-[#e0156a]" />

        <p className="font-body text-sm font-medium text-[#7a1352]/70">
          Chargement de vos formations...
        </p>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="relative mb-8 px-6 pt-6">
        <span className="mb-1 block font-script text-2xl text-[#e0156a]">
          Apprendre, grandir, oser
        </span>

        <h1 className="mb-2 font-display text-4xl font-bold text-[#1e1620]">
          Nos{" "}
          <span className="text-gradient-rise">
            Formations
          </span>
        </h1>

        <p className="font-body text-[#1e1620]/60">
          Découvrez tous les cours disponibles pour
          accélérer votre projet.
        </p>
      </div>

      {/* Search / filters */}
      <section className="mb-10 px-6">
        <div className="card-surface shadow-bloom flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[#fdfbf8]">
            <Search
              size={18}
              className="shrink-0 text-[#e0156a]/70"
            />

            <input
              type="text"
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full bg-transparent font-body text-[15px] text-[#1e1620] outline-none placeholder:text-[#1e1620]/40"
            />
          </div>

          <div className="my-2 hidden w-px self-stretch bg-[#f1e9de] sm:block" />

          <div className="flex items-center gap-2 px-1 sm:px-2">
            <SlidersHorizontal
              size={15}
              className="hidden shrink-0 text-[#1e1620]/30 sm:block"
            />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="cursor-pointer rounded-xl bg-transparent px-3 py-2.5 font-body text-sm font-medium text-[#7a1352] transition-colors hover:bg-[#fdfbf8] focus:bg-[#fdfbf8] focus:outline-none"
            >
              <option value="all">
                Toutes les catégories
              </option>

              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

            <select
              value={selectedLevel}
              onChange={(e) =>
                setSelectedLevel(e.target.value)
              }
              className="cursor-pointer rounded-xl bg-transparent px-3 py-2.5 font-body text-sm font-medium text-[#7a1352] transition-colors hover:bg-[#fdfbf8] focus:bg-[#fdfbf8] focus:outline-none"
            >
              <option value="all">
                Tous les niveaux
              </option>

              {levels.map((level) => (
                <option
                  key={level}
                  value={level}
                >
                  {level}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                aria-label="Réinitialiser les filtres"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1e1620]/40 transition-colors hover:bg-[#ffe3ee] hover:text-[#e0156a]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Courses */}
      <div className="px-6">
        {filteredCourses.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <p className="mb-4 font-body text-lg text-[#1e1620]/50">
              Aucun cours ne correspond à vos critères.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedLevel("all");
                }}
                className="font-body text-sm font-medium text-[#e0156a] underline-rise hover:text-[#7a1352]"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 pb-10 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const paid =
                paidCourses[course.id] === true;

              return (
                <div
                  key={course.id}
                  className="group card-surface flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(224,21,106,0.25)]"
                >
                  <div>
                    {/* Cover */}
                    <div className="relative h-48 w-full overflow-hidden">
                      {course.coverUrl ? (
                        <img
                          src={course.coverUrl}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#e0156a] via-[#c4136a] to-[#7a1352]">
                          <span className="z-10 font-script text-3xl text-white/95">
                            {course.category ||
                              "Formation"}
                          </span>

                          <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />

                          <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-white/10 transition-transform duration-700 group-hover:scale-125" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                      {/* Paid badge */}
                      {paid && (
                        <div className="absolute left-3 top-3 rounded-full bg-[#e9f9ef] px-3 py-1.5 font-body text-[11px] font-bold text-[#176b3a] shadow-sm">
                          ✓ Accès acquis
                        </div>
                      )}

                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-transform duration-500 group-hover:scale-110">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5 text-[#e0156a]"
                          fill="currentColor"
                        >
                          <path d="M12 21s-6.716-4.35-9.428-8.06C.29 9.51 1.02 5.6 4.318 4.09c2.1-.96 4.42-.29 5.682 1.51C11.262 3.8 13.582 3.13 15.682 4.09c3.298 1.51 4.028 5.42 1.746 8.85C18.716 16.65 12 21 12 21z" />
                        </svg>
                      </div>
                    </div>

                    {/* Information */}
                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        {course.category && (
                          <span className="rounded-full bg-[#ffe3ee] px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-[#7a1352]">
                            {course.category}
                          </span>
                        )}

                        {course.level && (
                          <span className="rounded-full bg-[#f6efe1] px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-[#8a6d1f]">
                            {course.level}
                          </span>
                        )}
                      </div>

                      <h2 className="mb-2 font-display text-xl font-bold leading-snug text-[#1e1620]">
                        {course.title}
                      </h2>

                      <p className="line-clamp-3 font-body text-sm leading-relaxed text-[#1e1620]/60">
                        {course.description}
                      </p>

                      {course.price !== undefined && (
                        <p className="mt-4 font-body text-sm font-semibold text-[#7a1352]">
                          {course.price === 0
                            ? "Gratuit"
                            : `${course.price} DZD`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-auto p-5 pt-0">
                    <button
                      type="button"
                      onClick={() =>
                        handleJoinCourse(course)
                      }
                      className="focus-ring group/btn relative block w-full overflow-hidden rounded-full bg-gradient-to-r from-[#e0156a] to-[#7a1352] py-2.5 text-center font-body font-medium text-white transition-all duration-300 hover:brightness-105 hover:shadow-[0_10px_25px_-8px_rgba(224,21,106,0.55)]"
                    >
                      <span className="relative z-10">
                        {paid
                          ? "Ouvrir le cours"
                          : "Rejoindre le cours"}
                      </span>

                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}