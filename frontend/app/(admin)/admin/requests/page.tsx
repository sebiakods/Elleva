"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Eye, Trash2 } from "lucide-react";

import { Header } from "@/components/layout/Header";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";


type ApplicationType = "EXPERT" | "INSTITUTION";
type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";


interface ApplicationRequest {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  fullName: string;
  email: string;
  createdAt: string;
}


interface RequestsData {
  requests: ApplicationRequest[];
}


const TYPE_LABELS = {
  EXPERT: "Experte",
  INSTITUTION: "Institution",
};


const STATUS_LABELS = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};


const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};



function getAuthToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("token");
}


export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ApplicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const handleDelete = async (
    id: string,
    type: ApplicationType
  ) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette demande ?"
    );

    if (!confirmed) return;

    try {
      const token = getAuthToken();

      const endpoint =
  `${API_URL}/api/account-requests/${id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression.");
      }

      setRequests((prev) =>
        prev.filter((request) => request.id !== id)
      );

    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cette demande.");
    }
  };

useEffect(() => {
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();

      const response = await fetch(
        `${API_URL}/account-requests`,
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        }
      );


      if (!response.ok) {
        throw new Error(
          "Impossible de charger les demandes."
        );
      }


      const data = await response.json();


      console.log("ACCOUNT REQUESTS:", data);


      setRequests(
        (data.requests || []).map((item: any) => ({
          id: item.id,
          type: item.type,
          status: item.status,
          fullName: item.fullName,
          email: item.email,
          createdAt: item.createdAt,
        }))
      );


    } catch (err) {

      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les demandes."
      );

    } finally {
      setLoading(false);
    }
  };


  fetchRequests();

}, []);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return requests;

    return requests.filter(
      (request) =>
        request.fullName
          ?.toLowerCase()
          .includes(query) ||
        request.email
          ?.toLowerCase()
          .includes(query)
    );
  }, [requests, search]);

  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => r.status === "PENDING"
    ).length,
    approved: requests.filter(
      (r) => r.status === "APPROVED"
    ).length,
  };

  return (
    <>
      <Header title="Gestion des demandes" />

      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-full border bg-white px-5 py-3 max-w-md">
          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Rechercher une demande..."
            className="outline-none text-sm w-full"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white border p-6">
            <p className="text-sm text-gray-500">
              Total demandes
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "…" : stats.total}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border p-6">
            <p className="text-sm text-gray-500">
              En attente
            </p>

            <h2 className="text-3xl font-bold mt-2 text-yellow-600">
              {loading ? "…" : stats.pending}
            </h2>
          </div>

          <div className="rounded-2xl bg-white border p-6">
            <p className="text-sm text-gray-500">
              Validées
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">
              {loading ? "…" : stats.approved}
            </h2>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-sand-50">
              <tr>
                <th className="p-4 text-left">
                  Utilisateur
                </th>
                <th className="p-4 text-left">
                  Type
                </th>
                <th className="p-4 text-left">
                  Date
                </th>
                <th className="p-4 text-left">
                  Statut
                </th>
                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center"
                  >
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t"
                  >
                    <td className="p-4">
                      <p className="font-semibold">
                        {request.fullName}
                      </p>

                      <p className="text-xs text-gray-500">
                        {request.email}
                      </p>
                    </td>

                    <td className="p-4">
                      {TYPE_LABELS[request.type]}
                    </td>

                    <td className="p-4">
                      {new Date(
                        request.createdAt
                      ).toLocaleDateString("fr-FR")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          STATUS_STYLES[
                            request.status
                          ]
                        }`}
                      >
                        {
                          STATUS_LABELS[
                            request.status
                          ]
                        }
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/requests/${request.type.toLowerCase()}/${request.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-white hover:bg-rose-600"
                        >
                          <Eye size={16} />
                          Voir détails
                        </Link>

                        <button
                          onClick={() =>
                            handleDelete(
                              request.id,
                              request.type
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading &&
                filteredRequests.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-6 text-center text-gray-500"
                    >
                      Aucune demande trouvée.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}