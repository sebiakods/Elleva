"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Check,
  X,
  FileText,
  ExternalLink,
  Mail,
} from "lucide-react";

import { Header } from "@/components/layout/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
).replace(/\/$/, "");

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";
type UrlType = "expert" | "institution";

interface Application {
  id: string;
  type: "EXPERT" | "INSTITUTION";
  status: ApplicationStatus;
  email: string;
  fullName?: string;
  motivation?: string;

  title?: string;
  experience?: string;
  specialties?: string;
  languages?: string;
  linkedin?: string;
  portfolio?: string;
  certifications?: string;
  cvPath?: string | null;

  organizationName?: string;
  organizationType?: string;
  wilaya?: string;
  contactName?: string;
  contactRole?: string;
  phone?: string;
  website?: string;
  sectors?: string;
  documentPath?: string | null;

  createdAt?: string;
}

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Validée",
  REJECTED: "Refusée",
};

function endpointFor(type: UrlType) {
  return type === "expert" ? "expert-applications" : "institution-applications";
}

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;
  const type = params.type as UrlType;

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchRequest() {
      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();

        const res = await fetch(`${API_URL}/${endpointFor(type)}/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          cache: "no-store",
        });

        if (res.status === 404) {
          setApplication(null);
          return;
        }

        if (!res.ok) {
          throw new Error("Impossible de charger la demande.");
        }

        const json = await res.json();

        setApplication({
          ...json.application,
          type: type === "expert" ? "EXPERT" : "INSTITUTION",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    if (id && type) {
      fetchRequest();
    }
  }, [id, type]);

  async function handleDecision(decision: "approve" | "reject") {
    try {
      setActionLoading(true);

      const token = getAuthToken();

      const res = await fetch(`${API_URL}/${endpointFor(type)}/${id}/${decision}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Action impossible.");
      }

      router.push("/admin/requests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  }

  function notify() {
    if (!application) return;

    const displayName =
      application.fullName ||
      application.organizationName ||
      application.contactName ||
      application.email;

    const subject = encodeURIComponent(
      application.type === "EXPERT"
        ? "Félicitations 🎉 Vous êtes Experte Ellevadz"
        : "Félicitations 🎉 Votre institution rejoint Ellevadz"
    );

    const body = encodeURIComponent(
`Bonjour ${displayName},

Nous avons le plaisir de vous annoncer que votre candidature a été acceptée.

Bienvenue dans la communauté Ellevadz.

L'équipe Ellevadz`
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${application.email}&su=${subject}&body=${body}`,
      "_blank"
    );
  }

  if (loading) {
    return (
      <>
        <Header title="Détails candidature" />
        <div className="p-10 text-gray-500">Chargement...</div>
      </>
    );
  }

  if (!application) {
    return (
      <>
        <Header title="Détails candidature" />
        <div className="p-10">Demande introuvable</div>
      </>
    );
  }

  const displayName = application.fullName || application.organizationName || "—";

  const fileHref = application.cvPath
    ? `${API_URL.replace("/api", "")}/${application.cvPath}`
    : application.documentPath
    ? `${API_URL.replace("/api", "")}/${application.documentPath}`
    : null;

  return (
    <>
      <Header title="Détails candidature" />

      <div className="space-y-6">
        <Link href="/admin/requests" className="flex items-center gap-2 text-rose-600">
          <ArrowLeft size={18} />
          Retour aux demandes
        </Link>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-gray-500">{application.email}</p>

          <span className="inline-block mt-4 rounded-full bg-yellow-100 px-4 py-2 text-sm text-yellow-700">
            {STATUS_LABELS[application.status]}
          </span>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Informations professionnelles</h2>

          {application.type === "EXPERT" ? (
            <div className="space-y-3">
              <p><b>Titre :</b> {application.title || "—"}</p>
              <p><b>Expérience :</b> {application.experience || "—"}</p>
              <p><b>Domaines :</b> {application.specialties || "—"}</p>
              <p><b>Langues :</b> {application.languages || "—"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p><b>Institution :</b> {application.organizationName || "—"}</p>
              <p><b>Type :</b> {application.organizationType || "—"}</p>
              <p><b>Wilaya :</b> {application.wilaya || "—"}</p>
              <p><b>Secteurs :</b> {application.sectors || "—"}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Présence professionnelle</h2>

          {application.linkedin && (
            <a href={application.linkedin} target="_blank" className="flex gap-2 text-rose-600">
              <ExternalLink size={16} />
              LinkedIn
            </a>
          )}

          {application.portfolio && (
            <a href={application.portfolio} target="_blank" className="flex gap-2 text-rose-600">
              <ExternalLink size={16} />
              Portfolio
            </a>
          )}

          {application.website && (
            <a href={application.website} target="_blank" className="flex gap-2 text-rose-600">
              <ExternalLink size={16} />
              Site web
            </a>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-4">Motivation</h2>
          <p>{application.motivation || "—"}</p>
        </div>

        {fileHref && (
          <div className="rounded-2xl border bg-white p-6">
            <a href={fileHref} target="_blank" className="flex gap-2 text-rose-600">
              <FileText size={20} />
              {application.type === "EXPERT" ? "Voir le CV" : "Voir le document"}
            </a>
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-5">Décision</h2>

          <div className="flex gap-4">
            <button
              disabled={actionLoading || application.status !== "PENDING"}
              onClick={() => handleDecision("approve")}
              className="rounded-xl bg-rose-500 px-5 py-3 text-white disabled:opacity-50"
            >
              <Check size={18} className="inline" />
              Accepter
            </button>

            <button
              disabled={actionLoading || application.status !== "PENDING"}
              onClick={() => handleDecision("reject")}
              className="rounded-xl border border-red-300 px-5 py-3 text-red-600 disabled:opacity-50"
            >
              <X size={18} className="inline" />
              Refuser
            </button>

            <button onClick={notify} className="rounded-xl bg-green-600 px-5 py-3 text-white">
              <Mail size={18} className="inline" />
              Notifier
            </button>
          </div>
        </div>
      </div>
    </>
  );
}