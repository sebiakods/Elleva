"use client";

import { ShieldCheck } from "lucide-react";
import { ProgramTable } from "@/components/admin/ProgramTable";

export default function AdminProgramsPage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-sand-50">
      <div className="w-full px-3 py-4 sm:px-5 sm:py-6 lg:px-6 lg:py-7">
        <div className="mx-auto w-full max-w-[1400px]">
          
          {/* Breadcrumb */}
          <div className="mb-5 flex items-center text-xs text-ink-soft sm:mb-6 sm:text-sm">
            <span>Espace Admin</span>

            <span className="mx-2 text-ink-soft/40">
              /
            </span>

            <span className="font-medium text-wine-700">
              Programmes de financement
            </span>
          </div>

          {/* Header */}
          <div className="relative mb-6 sm:mb-8">
            <div
              aria-hidden
              className="
                pointer-events-none
                absolute
                -right-10
                -top-10
                -z-10
                h-32
                w-32
                rounded-full
                bg-rise-gradient-soft
                opacity-60
                blur-3xl
                sm:-right-5
                sm:-top-12
                sm:h-48
                sm:w-48
              "
            />

            <div className="flex items-start gap-3">
              <div
                className="
                  mt-1
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-rose-50
                  sm:h-10
                  sm:w-10
                  sm:rounded-xl
                "
              >
                <ShieldCheck
                  size={18}
                  className="text-rose-500 sm:size-20"
                />
              </div>

              <div className="min-w-0">
                <p className="font-script text-xl leading-none text-rose-500 sm:text-2xl">
                  Espace Admin,
                </p>

                <h1 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-wine-900 sm:mt-2 sm:text-3xl lg:text-4xl">
                  Programmes de{" "}
                  <span className="text-gradient-rise">
                    financement
                  </span>
                </h1>

                <p className="mt-2 max-w-2xl text-xs leading-5 text-ink-soft sm:mt-3 sm:text-sm sm:leading-6">
                  Consultez et gérez les programmes de financement
                  disponibles sur Ellevadz.
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full min-w-0">
            <ProgramTable />
          </div>

        </div>
      </div>
    </main>
  );
}