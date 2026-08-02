"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export default function AdminProgramsPage() {

  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

    async function loadPrograms() {

      try {

        const token = localStorage.getItem("token");

        const res = await fetch(
          `${API_URL}/api/programs`,
          {
            headers:{
              Authorization:`Bearer ${token}`
            }
          }
        );


        const json = await res.json();


        setPrograms(
          json.data?.programs || []
        );


      } catch(err){

        console.error(err);

      } finally {

        setLoading(false);

      }

    }


    loadPrograms();

  },[]);



  return (

    <>
      <Header title="Programmes de financement" />


      <div className="mx-auto max-w-6xl p-8">


        <h1 className="text-2xl font-bold">
          Programmes de financement
        </h1>


        <p className="mt-2 text-gray-500">
          Consultez toutes les opportunités de financement.
        </p>



        {loading && (
          <p className="mt-8">
            Chargement...
          </p>
        )}



        <div className="mt-8 grid gap-6">


          {programs.map((program)=>(


            <div
              key={program.id}
              className="
                rounded-2xl
                border
                bg-white
                p-6
                shadow-sm
              "
            >


              <div className="flex justify-between">


                <div>


                  <h2 className="text-xl font-semibold">
                    {program.title}
                  </h2>


                  <p className="mt-2 text-gray-600">
                    Catégorie :
                    {" "}
                    {program.category}
                  </p>



                  {program.institution && (

                    <p className="mt-1 text-gray-600">
                      Institution :
                      {" "}
                      {program.institution.name}
                    </p>

                  )}



                  <p className="mt-2 font-medium">

                    Montant max :
                    {" "}
                    {program.maxAmount?.toLocaleString()}
                    {" "}
                    DZD

                  </p>


                </div>



                <Button
                  variant="ghost"
                  onClick={() =>
                    window.location.href =
                    `/admin/programmes/${program.id}`
                  }
                >

                  <Eye size={18}/>
                  Voir

                </Button>


              </div>


            </div>


          ))}


        </div>



      </div>

    </>
  );
}