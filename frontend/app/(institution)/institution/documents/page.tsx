"use client";

import { useMemo, useState } from "react";
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
  Landmark,
  Calendar,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type DocCategory = "formulaire" | "guide" | "modele" | "reglementation";
type FileType = "pdf" | "docx" | "xlsx";

type DocumentItem = {
  id: string;
  name: string;
  category: DocCategory;
  fileType: FileType;
  program: string | null;
  size: string;
  uploadedDate: string;
  downloads: number;
};

const MOCK_DOCUMENTS: DocumentItem[] = [
  {
    id: "1",
    name: "Formulaire de candidature - Programme Innovation Femmes",
    category: "formulaire",
    fileType: "pdf",
    program: "Programme Innovation Femmes 2026",
    size: "412 Ko",
    uploadedDate: "2026-05-02",
    downloads: 128,
  },
  {
    id: "2",
    name: "Guide de préparation du Business Plan",
    category: "guide",
    fileType: "pdf",
    program: null,
    size: "1.2 Mo",
    uploadedDate: "2026-04-18",
    downloads: 214,
  },
  {
    id: "3",
    name: "Modèle de prévisionnel financier",
    category: "modele",
    fileType: "xlsx",
    program: "Prêt PME 2026",
    size: "88 Ko",
    uploadedDate: "2026-06-01",
    downloads: 76,
  },
  {
    id: "4",
    name: "Règlement du concours Santé & Innovation",
    category: "reglementation",
    fileType: "pdf",
    program: "Concours Santé & Innovation",
    size: "540 Ko",
    uploadedDate: "2026-06-15",
    downloads: 39,
  },
  {
    id: "5",
    name: "Modèle de lettre de motivation",
    category: "modele",
    fileType: "docx",
    program: null,
    size: "56 Ko",
    uploadedDate: "2026-03-22",
    downloads: 152,
  },
  {
    id: "6",
    name: "Guide d'éligibilité - Subvention Agri-Femmes",
    category: "guide",
    fileType: "pdf",
    program: "Subvention Agri-Femmes",
    size: "301 Ko",
    uploadedDate: "2026-06-20",
    downloads: 61,
  },
];

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

export default function InstitutionDocumentsPage() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | DocCategory>(
    "all"
  );
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | FileType>(
    "all"
  );

  const filtered = useMemo(() => {
    return MOCK_DOCUMENTS.filter((d) => {
      const matchesQuery =
        query.trim() === "" ||
        d.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        (d.program ?? "").toLowerCase().includes(query.trim().toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || d.category === categoryFilter;
      const matchesFileType =
        fileTypeFilter === "all" || d.fileType === fileTypeFilter;

      return matchesQuery && matchesCategory && matchesFileType;
    });
  }, [query, categoryFilter, fileTypeFilter]);

  const stats = useMemo(() => {
    const total = MOCK_DOCUMENTS.length;
    const totalDownloads = MOCK_DOCUMENTS.reduce(
      (sum, d) => sum + d.downloads,
      0
    );
    const linkedPrograms = new Set(
      MOCK_DOCUMENTS.filter((d) => d.program).map((d) => d.program)
    ).size;

    return { total, totalDownloads, linkedPrograms };
  }, []);

  return (
    <>
      <Header title="Documents" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Bibliothèque documentaire</Badge>
            </div>

            

            <p className="mt-3 max-w-3xl text-ink-soft">
              Mettez à disposition les formulaires, guides et modèles
              nécessaires aux candidatures. Gérez vos documents requis par
              programme.
            </p>
          </div>

          <Link href="/institution/documents/new">
            <Button>
              <Plus size={18} />
              Ajouter un document
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
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
                <p className="font-display text-2xl text-ink">
                  {stats.totalDownloads}
                </p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Programmes liés</p>
                <p className="font-display text-2xl text-ink">
                  {stats.linkedPrograms}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <Input
                placeholder="Rechercher un document ou un programme..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Select
              label=""
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as "all" | DocCategory)
              }
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
              onChange={(e) =>
                setFileTypeFilter(e.target.value as "all" | FileType)
              }
            >
              <option value="all">Tous les formats</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="xlsx">Excel</option>
            </Select>
          </div>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <Card hover={false}>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                <FolderOpen size={22} />
              </div>
              <p className="font-display text-xl text-ink">
                Aucun document trouvé
              </p>
              <p className="max-w-md text-sm text-ink-soft">
                Essayez de modifier vos filtres ou ajoutez un nouveau
                document.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((doc) => {
              const FileIcon = FILE_ICONS[doc.fileType];

              return (
                <Card key={doc.id}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${FILE_ICON_COLORS[doc.fileType]}`}
                    >
                      <FileIcon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone={CATEGORY_TONES[doc.category]}>
                          {CATEGORY_LABELS[doc.category]}
                        </Badge>
                        <span className="text-xs uppercase text-ink-soft">
                          {doc.fileType} · {doc.size}
                        </span>
                      </div>

                      <h3 className="font-display text-lg leading-snug text-ink">
                        {doc.name}
                      </h3>

                      {doc.program && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
                          <Landmark size={14} />
                          {doc.program}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-sand-100 pt-4 text-sm text-ink-soft">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(doc.uploadedDate).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Download size={14} />
                      {doc.downloads} téléchargements
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-sand-200 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-sand-50">
                      <Eye size={16} />
                      Aperçu
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700">
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
    </>
  );
}