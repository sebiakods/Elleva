"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  level: string;
  durationMinutes: number;
  lessonCount: number;
  enrolledCount: number;
  rating: number;
  coverUrl?: string | null;
  isPublished: boolean;
};


export default function EditCoursePage() {

  const params = useParams();
  const router = useRouter();

  const id = params.id as string;


  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {

    async function loadCourse(){

      try {

        const token =
          localStorage.getItem("accessToken");


        const res = await fetch(
          `${API_URL}/courses/${id}`,
          {
            headers:{
              Authorization:`Bearer ${token}`,
            },
          }
        );


        const json = await res.json();


        if(!res.ok){
          throw new Error(json.message);
        }


        setCourse(json.data);


      } catch(error){

        console.error(error);

      } finally {

        setLoading(false);

      }

    }


    if(id){
      loadCourse();
    }

  },[id]);



  function updateField(
    field:keyof Course,
    value:any
  ){

    if(!course) return;


    setCourse({
      ...course,
      [field]:value,
    });

  }



  async function saveCourse(
    e:React.FormEvent
  ){

    e.preventDefault();


    if(!course) return;


    try {

      setSaving(true);


      const token =
        localStorage.getItem("accessToken");


      const res = await fetch(
        `${API_URL}/courses/${id}`,
        {
          method:"PUT",
          headers:{
            "Content-Type":"application/json",
            Authorization:`Bearer ${token}`,
          },
          body:JSON.stringify({

            title:course.title,

            description:course.description,

            category:course.category,

            level:course.level,

            durationMinutes:
              Number(course.durationMinutes),

            coverUrl:
              course.coverUrl,

            isPublished:
              course.isPublished,

          }),
        }
      );


      const json = await res.json();


      if(!res.ok){
        throw new Error(json.message);
      }


      router.push("/expert/courses");


    }catch(error:any){

      alert(error.message);

    }finally{

      setSaving(false);

    }

  }



  if(loading){

    return (
      <div className="p-10 text-center">
        Chargement...
      </div>
    );

  }


  if(!course){

    return (
      <div className="p-10 text-center">
        Cours introuvable
      </div>
    );

  }



return (
  <>


    <div className="p-6">

      <div className="grid gap-6 lg:grid-cols-3">

        {/* Main form */}
        <div className="lg:col-span-2 card-surface p-6">

          <div className="flex items-start justify-between mb-8">

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Modifier le cours
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Mettez à jour les informations de votre formation.
              </p>
            </div>


            <Button
              variant="secondary"
              onClick={() =>
                router.push("/expert/courses")
              }
            >
              <ArrowLeft size={16}/>
              Retour
            </Button>

          </div>


          <form
            onSubmit={saveCourse}
            className="space-y-6"
          >


            <div className="space-y-2">

              <label className="text-sm font-medium">
                Titre du cours
              </label>

              <input
                className="
                  w-full rounded-xl border border-gray-200
                  bg-white px-4 py-3
                  outline-none transition
                  focus:border-purple-400
                  focus:ring-2 focus:ring-purple-100
                "
                value={course.title}
                onChange={(e)=>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
              />

            </div>



            <div className="space-y-2">

              <label className="text-sm font-medium">
                Description
              </label>


              <textarea
                rows={6}
                className="
                  w-full rounded-xl border border-gray-200
                  bg-white px-4 py-3
                  outline-none transition
                  resize-none
                  focus:border-purple-400
                  focus:ring-2 focus:ring-purple-100
                "
                value={course.description}
                onChange={(e)=>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
              />

            </div>



            <div className="grid md:grid-cols-2 gap-5">


              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Catégorie
                </label>

                <input
                  className="
                  w-full rounded-xl border border-gray-200
                  px-4 py-3 outline-none
                  focus:border-purple-400
                  "
                  value={course.category}
                  onChange={(e)=>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                />

              </div>



              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Niveau
                </label>


                <select
                  className="
                  w-full rounded-xl border border-gray-200
                  px-4 py-3 bg-white outline-none
                  focus:border-purple-400
                  "
                  value={course.level}
                  onChange={(e)=>
                    updateField(
                      "level",
                      e.target.value
                    )
                  }
                >

                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>

                </select>


              </div>


            </div>



            <div className="grid md:grid-cols-2 gap-5">


              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Durée (minutes)
                </label>


                <input
                  type="number"
                  className="
                  w-full rounded-xl border border-gray-200
                  px-4 py-3 outline-none
                  focus:border-purple-400
                  "
                  value={course.durationMinutes}
                  onChange={(e)=>
                    updateField(
                      "durationMinutes",
                      Number(e.target.value)
                    )
                  }
                />

              </div>


              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Image couverture
                </label>


                <input
                  className="
                  w-full rounded-xl border border-gray-200
                  px-4 py-3 outline-none
                  focus:border-purple-400
                  "
                  value={course.coverUrl || ""}
                  onChange={(e)=>
                    updateField(
                      "coverUrl",
                      e.target.value
                    )
                  }
                />

              </div>


            </div>



            <div className="
              flex items-center justify-between
              rounded-xl bg-gray-50 p-4
            ">

              <div>

                <p className="font-medium">
                  Publication
                </p>

                <p className="text-sm text-gray-500">
                  Rendre le cours visible aux entrepreneures
                </p>

              </div>


              <input
                type="checkbox"
                className="h-5 w-5 accent-purple-600"
                checked={course.isPublished}
                onChange={(e)=>
                  updateField(
                    "isPublished",
                    e.target.checked
                  )
                }
              />


            </div>



            <button
              type="submit"
              disabled={saving}
              className="
              flex items-center gap-2
              rounded-xl
              bg-purple-600
              px-6 py-3
              text-white
              font-medium
              shadow-sm
              hover:bg-purple-700
              transition
              disabled:opacity-50
              "
            >

              <Save size={17}/>

              {
                saving
                ? "Enregistrement..."
                : "Enregistrer"
              }

            </button>


          </form>


        </div>



        {/* Side information */}
        <div className="space-y-5">


          <div className="card-surface p-5">

            <h2 className="font-semibold mb-4">
              Aperçu
            </h2>


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


            <h3 className="mt-4 font-semibold">
              {course.title}
            </h3>


            <p className="mt-2 text-sm text-gray-500">
              {course.category}
            </p>


          </div>



          <div className="card-surface p-5">

            <h2 className="font-semibold mb-4">
              Statistiques
            </h2>


            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span>Leçons</span>
                <b>{course.lessonCount}</b>
              </div>


              <div className="flex justify-between">
                <span>Inscrits</span>
                <b>{course.enrolledCount}</b>
              </div>


              <div className="flex justify-between">
                <span>Note</span>
                <b>⭐ {course.rating}</b>
              </div>


            </div>

          </div>


        </div>


      </div>

    </div>
  </>
);
}