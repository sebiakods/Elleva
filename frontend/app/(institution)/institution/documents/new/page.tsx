"use client";

import { useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  File,
  UploadCloud,
  X,
  Send,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { authFetch } from "@/lib/authFetch"; // Ajustez le chemin selon votre structure

type DocCategory = "formulaire" | "guide" | "modele" | "reglementation";

type DocumentForm = {
  name: string;
  category: DocCategory;
  program: string;
  description: string;
  status: "draft" | "published";
};

const API_BASE = '/api';

const PROGRAMS = [
  "Programme Innovation Femmes 2026",
  "Micro-crédit Numérique",
  "Subvention Agri-Femmes",
  "Prêt PME 2026",
  "Concours Santé & Innovation",
];

const initialForm: DocumentForm = {
  name: "",
  category: "formulaire",
  program: "",
  description: "",
  status: "draft",
};

type Toast = { type: "success" | "error"; text: string };

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return FileSpreadsheet;
  if (ext === "pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<DocumentForm>(initialForm);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Toast | null>(null);

  function update<K extends keyof DocumentForm>(
    key: K,
    value: DocumentForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  }

  function handleFileSelect(selected: File | null) {
    if (!selected) return;
    setFile(selected);

    if (!form.name) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, "");
      update("name", nameWithoutExt);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0] ?? null;
    handleFileSelect(dropped);
  }

  async function postDocument(form: DocumentForm, file: File | null) {
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("isRequired", "false");
    if (file) fd.append("file", file);

    const res = await authFetch(`${API_BASE}/documents`, {
      method: "POST",
      body: fd,
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Échec de l'envoi du document");
    }
    return json.data;
  }

  async function saveDraft() {
    setSaving(true);
    try {
      await postDocument(form, file);
      setMessage({ type: "success", text: "Le document a été enregistré." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setSaving(false);
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setMessage({
        type: "error",
        text: "Veuillez sélectionner un fichier avant de publier.",
      });
      return;
    }

    setSaving(true);
    try {
      await postDocument(form, file);
      setMessage({ type: "success", text: "Le document a été publié." });
      router.push("/institution/documents");
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Erreur",
      });
    } finally {
      setSaving(false);
    }
  }

  const FileIcon = file ? getFileIcon(file.name) : FolderOpen;

  return (
    <>
      <Header title="Ajouter un document" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <Badge tone="rose">Nouveau document</Badge>
              <Badge tone="gold">Institution</Badge>
            </div>

            <p className="mt-3 max-w-3xl text-ink-soft">
              Mettez à disposition un formulaire, un guide ou un modèle pour
              les entrepreneures candidates.
            </p>
          </div>

          <Link href="/institution/documents">
            <Button variant="outline">
              <ArrowLeft size={18} />
              Retour
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <form className="space-y-8" onSubmit={submit}>
            {/* File upload */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <UploadCloud size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">Fichier</h2>
                  <p className="text-sm text-ink-soft">
                    Formats acceptés : PDF, Word, Excel.
                  </p>
                </div>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                  dragActive
                    ? "border-rose-400 bg-rose-50"
                    : "border-sand-200 bg-sand-50 hover:border-rose-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) =>
                    handleFileSelect(e.target.files?.[0] ?? null)
                  }
                />

                {file ? (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <FileIcon size={22} />
                    </div>
                    <div>
                      <p className="font-semibold text-ink">{file.name}</p>
                      <p className="text-sm text-ink-soft">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"
                    >
                      <X size={14} />
                      Retirer le fichier
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sand-100 text-ink-soft">
                      <UploadCloud size={22} />
                    </div>
                    <p className="font-semibold text-ink">
                      Glissez-déposez un fichier ici
                    </p>
                    <p className="text-sm text-ink-soft">
                      ou cliquez pour parcourir vos fichiers
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* General information */}
            <Card hover={false}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FolderOpen size={22} />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-ink">
                    Informations générales
                  </h2>
                  <p className="text-sm text-ink-soft">
                    Ces informations aideront les entrepreneures à retrouver
                    ce document.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Nom du document"
                  placeholder="Formulaire de candidature 2026"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />

                <Select
                  label="Catégorie"
                  value={form.category}
                  onChange={(e) =>
                    update("category", e.target.value as DocCategory)
                  }
                >
                  <option value="formulaire">Formulaire</option>
                  <option value="guide">Guide</option>
                  <option value="modele">Modèle</option>
                  <option value="reglementation">Réglementation</option>
                </Select>

                <div className="md:col-span-2">
                  <Select
                    label="Programme associé (optionnel)"
                    value={form.program}
                    onChange={(e) => update("program", e.target.value)}
                  >
                    <option value="">Aucun programme spécifique</option>
                    {PROGRAMS.map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-ink-soft">
                      Description (optionnel)
                    </span>
                    <textarea
                      rows={4}
                      className="w-full rounded-xl border border-sand-200 bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft/50 transition-colors focus-ring focus:border-rose-400"
                      placeholder="Précisez le contenu ou l'usage de ce document."
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </Card>

            {/* Status */}
            <Card hover={false}>
              <div className="mb-6">
                <h2 className="font-display text-2xl text-ink">Statut</h2>
                <p className="text-sm text-ink-soft">
                  Choisissez si le document est visible immédiatement.
                </p>
              </div>

              <Select
                label="Statut de publication"
                value={form.status}
                onChange={(e) =>
                  update("status", e.target.value as "draft" | "published")
                }
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publié</option>
              </Select>
            </Card>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-sand-200 pt-6 sm:flex-row sm:justify-end">
              <Link href="/institution/documents">
                <button
                  type="button"
                  className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50"
                >
                  Annuler
                </button>
              </Link>

              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="rounded-xl border border-sand-300 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enregistrer comme brouillon
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Publier le document
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview */}
          <aside className="sticky top-6 h-fit rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <FolderOpen size={18} />
              </div>
              <div>
                <h3 className="font-bold text-ink">Aperçu</h3>
                <p className="text-sm text-ink-soft">
                  Vue dans la bibliothèque documentaire
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-sand-50 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <FileIcon size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">
                  {form.name || "Nom du document"}
                </p>
                <p className="text-xs text-ink-soft">
                  {file ? formatFileSize(file.size) : "Aucun fichier"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Catégorie</span>
                <span className="font-semibold text-ink">
                  {form.category === "formulaire" && "Formulaire"}
                  {form.category === "guide" && "Guide"}
                  {form.category === "modele" && "Modèle"}
                  {form.category === "reglementation" && "Réglementation"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Programme</span>
                <span className="max-w-[60%] truncate text-right font-semibold text-ink">
                  {form.program || "Aucun"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-soft">Statut</span>
                <span className="font-semibold text-ink">
                  {form.status === "draft" ? "Brouillon" : "Publié"}
                </span>
              </div>
            </div>

            {form.description && (
              <div className="mt-4 rounded-xl bg-rose-50 p-4">
                <p className="line-clamp-4 text-sm text-rose-900">
                  {form.description}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>

      {message && (
        <div
          className={`fixed bottom-6 right-6 rounded-xl px-5 py-4 text-sm font-semibold shadow-lg ${
            message.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}
