"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Landmark,
  Calendar,
  Wallet,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Program {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  sector?: string;
  fundingType?: string;
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  openingDate?: string;
  closingDate?: string;
  region?: string;
  status?: string;
  institution?: {
    name?: string;
  };
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPrograms();
  }, []);


  async function loadPrograms() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/programs`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );


      if (!response.ok) {
        throw new Error(
          "Erreur lors du chargement des programmes"
        );
      }


      const result = await response.json();

      console.log("PROGRAMS RESPONSE:", result);


      setPrograms(
        result.data?.items ||
        result.data ||
        []
      );


    } catch (err: any) {
      console.error(err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }


  const filteredPrograms = programs.filter((program) =>
    program.title
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );


  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold">
            Programmes de financement
          </h1>

          <p className="text-gray-500 mt-1">
            Découvrez les opportunités de financement disponibles.
          </p>
        </div>


        <div className="relative">

          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="
              pl-10 pr-4 py-2
              border rounded-lg
              w-64
            "
          />

        </div>

      </div>



      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" size={32}/>
        </div>
      )}



      {/* Error */}
      {error && (
        <div className="
          bg-red-100
          text-red-700
          p-4
          rounded-lg
        ">
          {error}
        </div>
      )}



      {/* Empty */}
      {!loading && filteredPrograms.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          Aucun programme disponible.
        </div>
      )}



      {/* Cards */}
      <div className="
        grid
        md:grid-cols-2
        xl:grid-cols-3
        gap-6
      ">

        {filteredPrograms.map((program)=>(

          <div
            key={program.id}
            className="
              bg-white
              border
              rounded-xl
              p-5
              shadow-sm
              hover:shadow-md
              transition
            "
          >

            <div className="flex items-start gap-3 mb-4">

              <div className="
                p-3
                rounded-lg
                bg-purple-100
              ">
                <Landmark
                  size={22}
                  className="text-purple-700"
                />
              </div>


              <h2 className="font-semibold text-lg">
                {program.title}
              </h2>

            </div>



            {program.category && (
              <p className="text-sm text-gray-600 mb-2">
                Catégorie : {program.category}
              </p>
            )}



            {program.fundingType && (
              <p className="text-sm text-gray-600 mb-2">
                Type : {program.fundingType}
              </p>
            )}



            {program.amountMax && (
              <div className="
                flex
                items-center
                gap-2
                text-sm
                mb-2
              ">
                <Wallet size={16}/>
                Montant max :
                {" "}
                {program.amountMax.toLocaleString()}
                {" "}
                {program.currency || "DZD"}
              </div>
            )}



            {program.closingDate && (
              <div className="
                flex
                items-center
                gap-2
                text-sm
                mb-2
              ">
                <Calendar size={16}/>
                Date limite :
                {" "}
                {new Date(
                  program.closingDate
                ).toLocaleDateString()}
              </div>
            )}



            {program.shortDescription && (
              <p className="
                text-sm
                text-gray-500
                mt-4
              ">
                {program.shortDescription}
              </p>
            )}

          </div>

        ))}

      </div>

    </div>
  );
}