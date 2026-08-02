import {
  ClipboardList,
  Search,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import { PageShell } from "@/components/common/PageShell";

const applications = [
  {
    id: 1,
    name: "Sofia Benali",
    project: "EcoTech Solutions",
    program: "Programme Innovation Verte",
    status: "En attente",
    date: "11 Juillet 2026",
  },
  {
    id: 2,
    name: "Amel Haddad",
    project: "Digital Women Hub",
    program: "Entrepreneuriat Féminin",
    status: "Acceptée",
    date: "09 Juillet 2026",
  },
  {
    id: 3,
    name: "Lina Cherif",
    project: "Agri Smart",
    program: "Startup Agriculture",
    status: "Refusée",
    date: "05 Juillet 2026",
  },
];

export default function InstitutionApplicationsPage() {
  return (
    <div className="space-y-6">

      <PageShell
        title="Candidatures"
        badge="Dossiers reçus"
        icon={ClipboardList}
        description="Examinez les dossiers soumis par les entrepreneures. Approuvez, rejetez ou mettez en liste d'attente chaque candidature."
      />

      <div className="space-y-6">

        {/* Search */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Rechercher…"
              className="w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
          </div>
        </div>


        {/* Applications */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="font-bold text-gray-900">
              Candidatures reçues
            </h2>
          </div>


          <div className="divide-y">

            {applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
              >

                <div>
                  <h3 className="font-bold text-gray-900">
                    {application.name}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {application.project}
                  </p>

                  <p className="text-xs text-gray-400">
                    {application.program} • {application.date}
                  </p>
                </div>


                <div className="flex items-center gap-2">

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      application.status === "Acceptée"
                        ? "bg-green-100 text-green-700"
                        : application.status === "Refusée"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {application.status}
                  </span>


                  <button className="rounded-lg p-2 hover:bg-gray-100">
                    <Eye className="h-5 w-5 text-gray-600" />
                  </button>


                  <button className="rounded-lg p-2 hover:bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </button>


                  <button className="rounded-lg p-2 hover:bg-red-50">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </button>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}