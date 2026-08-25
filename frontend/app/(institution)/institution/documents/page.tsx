"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Search,
  FileText,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authFetch } from "@/lib/authFetch";


type DocCategory = "formulaire" | "guide" | "modele" | "reglementation";
type FileType = "pdf" | "docx" | "xlsx";

type DocumentItem = {
  id: string;
  name: string;
  description: string;
  type: DocCategory;
  fileUrl: string | null;
  fileSizeBytes: string | null;
  downloadCount: number;
  createdAt: string;
  institutionProfile?: { institutionName: string };
};

const CATEGORY_LABELS: Record<DocCategory, string> = {
  formulaire: "Formulaire",
  guide: "Guide",
  modele: "Modèle",
  reglementation: "Réglementation",
};

const CATEGORY_TONES: Record<DocCategory, "gold" | "wine" | "rose"> = {
  formulaire: "rose",
  guide: "wine",
  modele: "gold",
  reglementation: "rose",
};

function getFileType(fileUrl: string | null): FileType {
  if (!fileUrl) return "pdf";
  const ext = fileUrl.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  if (ext === "doc" || ext === "docx") return "docx";
  return "pdf";
}

const FILE_ICONS: Record<FileType, typeof FileText> = {
  pdf: FileText,
  docx: File,
  xlsx: FileSpreadsheet,
};

const FILE_ICON_COLORS: Record<FileType, string> = {
  pdf: "bg-rose-100 text-rose-600",
  docx: "bg-blue-100 text-blue-600",
  xlsx: "bg-emerald-100 text-emerald-600",
};

function formatSize(bytes: string | null) {
  if (!bytes) return "—";
  const n = Number(bytes);
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function InstitutionDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | DocCategory>("all");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | FileType>("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await authFetch("/documents");
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || "Erreur lors du chargement des documents");
        }
        setDocuments(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchesQuery =
        query.trim() === "" ||
        d.name.toLowerCase().includes(query.trim().toLowerCase());

      const matchesCategory = categoryFilter === "all" || d.type === categoryFilter;
      const matchesFileType =
        fileTypeFilter === "all" || getFileType(d.fileUrl) === fileTypeFilter;

      return matchesQuery && matchesCategory && matchesFileType;
    });
  }, [documents, query, categoryFilter, fileTypeFilter]);

  const stats = useMemo(() => {
    const total = documents.length;
    const totalDownloads = documents.reduce((sum, d) => sum + (d.downloadCount || 0), 0);
    return { total, totalDownloads };
  }, [documents]);

  async function handleDownload(doc: DocumentItem) {
    if (!doc.fileUrl) return;
    await authFetch(`/documents/${doc.id}/download`, {
        method: "POST",
      });
    setDocuments((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, downloadCount: d.downloadCount + 1 } : d))
    );
    window.open(doc.fileUrl, "_blank");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Breadcrumb */}
      <div className="text-sm text-ink-soft">
        <span>Espace Institution</span>
        <span className="mx-2 text-ink-soft/40">/</span>
        <span className="font-medium text-wine-700">Documents</span>
      </div>

      {/* Header Section */}
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 right-0 -z-10 h-56 w-56 rounded-full bg-rise-gradient-soft opacity-70 blur-3xl md:h-72 md:w-72"
        />

        <div>
          <p className="font-script text-2xl leading-none text-rose-500">
            Espace de téléchargement
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-wine-900 sm:text-4xl">
            Bibliothèque <span className="text-gradient-rise">Documentaire</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">
            Mettez à disposition les formulaires, guides, modèles et réglementations nécessaires
            aux candidatures et à l&apos;accompagnement.
          </p>
        </div>

        <Link href="/institution/documents/new" className="shrink-0">
          <Button>
            <Plus size={18} />
            Ajouter un document
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-sm text-ink-soft">Total documents</p>
              <p className="font-display text-2xl text-ink">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card hover={false}>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Download size={20} />
            </div>
            <div>
              <p className="text-sm text-ink-soft">Téléchargements</p>
              <p className="font-display text-2xl text-ink">{stats.totalDownloads}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card hover={false}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <Input
              placeholder="Rechercher un document..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-11"
            />
          </div>

          <Select
            label=""
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "all" | DocCategory)}
          >
            <option value="all">Toutes les catégories</option>
            <option value="formulaire">Formulaire</option>
            <option value="guide">Guide</option>
            <option value="modele">Modèle</option>
            <option value="reglementation">Réglementation</option>
          </Select>

          <Select
            label=""
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value as "all" | FileType)}
          >
            <option value="all">Tous les formats</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
            <option value="xlsx">Excel</option>
          </Select>
        </div>
      </Card>

      {/* Documents List Content */}
      {loading ? (
        <Card hover={false}>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-soft">
            <Loader2 size={24} className="animate-spin text-rose-600" />
            <p className="text-sm">Chargement des documents...</p>
          </div>
        </Card>
      ) : error ? (
        <Card hover={false}>
          <p className="py-10 text-center text-sm font-medium text-red-600">{error}</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card hover={false}>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
              <FolderOpen size={22} />
            </div>
            <p className="font-display text-xl text-ink">Aucun document trouvé</p>
            <p className="max-w-md text-sm text-ink-soft">
              Essayez de modifier vos filtres ou ajoutez un nouveau document.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((doc) => {
            const fileType = getFileType(doc.fileUrl);
            const FileIcon = FILE_ICONS[fileType];

            return (
              <Card key={doc.id}>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${FILE_ICON_COLORS[fileType]}`}
                  >
                    <FileIcon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={CATEGORY_TONES[doc.type] ?? "wine"}>
                        {CATEGORY_LABELS[doc.type] ?? doc.type}
                      </Badge>
                      <span className="text-xs uppercase text-ink-soft font-medium">
                        {fileType} · {formatSize(doc.fileSizeBytes)}
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-lg leading-snug text-ink">
                      {doc.name}
                    </h3>

                    {doc.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4 text-sm text-ink-soft">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {new Date(doc.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download size={14} />
                    {doc.downloadCount} téléchargements
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      doc.fileUrl &&
                      window.open(doc.fileUrl, "_blank")
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50"
                  >
                    <Eye size={16} />
                    Aperçu
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                  >
                    <Download size={16} />
                    Télécharger
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
