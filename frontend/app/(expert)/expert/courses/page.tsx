"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  Users,
  Star,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Reveal } from "@/components/common/Reveal";

type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  lessonCount: number;
  enrolledCount: number;
  rating: number;
  isPublished: boolean;
};

const levelTone: Record<string, "rose" | "wine" | "gold"> = {
  Débutant: "rose",
  Intermédiaire: "gold",
  Avancé: "wine",
};

export default function ExpertCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setCourses(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Supprimer ce cours ?")) return;

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setCourses((prev) =>
        prev.filter((course) => course.id !== id)
      );

    } catch (err: any) {
      alert(err.message);
    }
  }

  const filtered = courses.filter((course) =>
    course.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Mes cours" />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex w-full max-w-xs items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2">

          <Search size={15} />

          <input
            className="w-full bg-transparent outline-none"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        <Button
          onClick={() =>
            router.push("/expert/courses/create")
          }
        >
          <Plus size={16} />
          Créer un cours
        </Button>

      </div>


      {loading ? (

        <div className="text-center py-16">
          Chargement...
        </div>

      ) : filtered.length === 0 ? (

        <Reveal>

          <div className="card-surface">

            <EmptyState
              icon={GraduationCap}
              title="Aucun cours"
              description="Créez votre premier cours."
              action={{
                label: "Créer un cours",
                onClick: () =>
                  router.push("/expert/courses/create"),
              }}
            />

          </div>

        </Reveal>

      ) : (

        <div className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">

          {filtered.map((course, i) => (

            <Reveal
              key={course.id}
              delay={i * 60}
            >

              <div className="card-surface flex h-full flex-col">


                <div className="flex h-36 items-center justify-center bg-rise-gradient-soft rounded-t-xl2">

                  <GraduationCap
                    size={42}
                    className="text-rose-500"
                  />

                </div>


                <div className="flex flex-1 flex-col p-5">


                  <div className="mb-2 flex justify-between">

                    <Badge
                      tone={
                        levelTone[course.level] ?? "rose"
                      }
                    >
                      {course.level}
                    </Badge>


                    <Badge
                      tone={
                        course.isPublished
                          ? "rose"
                          : "neutral"
                      }
                    >
                      {
                        course.isPublished
                          ? "Publié"
                          : "Brouillon"
                      }
                    </Badge>

                  </div>


                  <h3 className="font-semibold min-h-[48px] line-clamp-2">
                    {course.title}
                  </h3>


                  <p className="text-sm text-gray-500 mb-4 min-h-[20px]">
                    {course.category}
                  </p>


                  <div className="flex justify-between text-sm border-t pt-3">


                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {course.enrolledCount}
                    </span>


                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      {course.lessonCount} leçons
                    </span>


                    <span className="flex items-center gap-1">
                      <Star size={13} />
                      {Number(course.rating).toFixed(1)}
                    </span>


                  </div>


                  <div className="mt-4 flex gap-2">


                    <Link
                      href={`/expert/courses/${course.id}`}
                      className="flex-1"
                    >

                      <Button
                        className="w-full"
                        variant="secondary"
                        size="sm"
                      >

                        <Pencil size={14} />

                        Modifier

                      </Button>

                    </Link>


                    <button
                      onClick={() =>
                        deleteCourse(course.id)
                      }
                      className="rounded-lg p-2 hover:bg-red-50 text-red-500"
                    >

                      <Trash2 size={16} />

                    </button>


                  </div>


                </div>


              </div>


            </Reveal>

          ))}

        </div>

      )}

    </>
  );
}