"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Wallet,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const categories = [
  { value: "BANK_LOAN", label: "Bank Loan" },
  { value: "ISLAMIC_FINANCE", label: "Islamic Finance" },
  { value: "GOVERNMENT_GRANT", label: "Government Grant" },
  { value: "STARTUP_FUNDING", label: "Startup Funding" },
];

const fundingTypes = [
  "Grant",
  "Loan",
  "Interest-free loan",
  "Equity",
  "Guarantee",
  "Mixed financing",
];

const currencies = ["DZD", "EUR", "USD"];

export default function NewProgramPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "GOVERNMENT_GRANT",
    sector: "",
    fundingType: "",
    amountMin: "",
    amountMax: "",
    currency: "DZD",
    openingDate: "",
    closingDate: "",
    region: "",
    targetAudience: "",
    website: "",
    email: "",
    phone: "",
    isPublished: true,
    isArchived: false,
  });

  const [eligibility, setEligibility] = useState<string[]>([""]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([""]);

  const updateField = (
    field: keyof typeof form,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: createSlug(value),
    }));
  };

  const updateArrayItem = (
    type: "eligibility" | "requiredDocuments",
    index: number,
    value: string
  ) => {
    if (type === "eligibility") {
      setEligibility((prev) =>
        prev.map((item, i) => (i === index ? value : item))
      );
    } else {
      setRequiredDocuments((prev) =>
        prev.map((item, i) => (i === index ? value : item))
      );
    }
  };

  const addArrayItem = (type: "eligibility" | "requiredDocuments") => {
    if (type === "eligibility") {
      setEligibility((prev) => [...prev, ""]);
    } else {
      setRequiredDocuments((prev) => [...prev, ""]);
    }
  };

  const removeArrayItem = (
    type: "eligibility" | "requiredDocuments",
    index: number
  ) => {
    if (type === "eligibility") {
      setEligibility((prev) => {
        if (prev.length === 1) return [""];
        return prev.filter((_, i) => i !== index);
      });
    } else {
      setRequiredDocuments((prev) => {
        if (prev.length === 1) return [""];
        return prev.filter((_, i) => i !== index);
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("You are not authenticated.");
      }

      if (!form.title.trim()) {
        throw new Error("Program title is required.");
      }

      if (!form.description.trim()) {
        throw new Error("Description is required.");
      }

      if (!form.amountMin || !form.amountMax) {
        throw new Error("Please enter both minimum and maximum funding amounts.");
      }

      const amountMin = Number(form.amountMin);
      const amountMax = Number(form.amountMax);

      if (Number.isNaN(amountMin) || Number.isNaN(amountMax)) {
        throw new Error("Funding amounts must be valid numbers.");
      }

      if (amountMin < 0 || amountMax < 0) {
        throw new Error("Funding amounts cannot be negative.");
      }

      if (amountMin > amountMax) {
        throw new Error(
          "Minimum funding amount cannot be greater than maximum funding amount."
        );
      }

      const cleanEligibility = eligibility
        .map((item) => item.trim())
        .filter(Boolean);

      const cleanDocuments = requiredDocuments
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || createSlug(form.title),
        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim(),
        category: form.category,
        sector: form.sector.trim() || null,
        fundingType: form.fundingType.trim() || null,

        amountMin,
        amountMax,
        currency: form.currency,

        openingDate: form.openingDate
          ? new Date(`${form.openingDate}T00:00:00`).toISOString()
          : null,

        closingDate: form.closingDate
          ? new Date(`${form.closingDate}T23:59:59`).toISOString()
          : null,

        region: form.region.trim() || null,
        targetAudience: form.targetAudience.trim() || null,

        eligibility: cleanEligibility,
        requiredDocuments: cleanDocuments,

        website: form.website.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,

        isPublished: form.isPublished,
        isArchived: form.isArchived,
      };

      const response = await fetch(`${API_URL}/institution/programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to create the financing program."
        );
      }

      router.push("/institution/programs");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <button
            type="button"
            onClick={() => router.push("/institution/programs")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Programs
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Building2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Create Financing Program
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Add a complete financing or funding opportunity for
                entrepreneurs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="mt-0.5">⚠️</div>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Basic Information"
              description="Describe your financing program."
            />

            <div className="grid gap-6 p-6">
              <Input
                label="Program title"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Startup Financing Program"
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Slug"
                  value={form.slug}
                  onChange={(value) => updateField("slug", value)}
                  placeholder="startup-financing-program"
                  hint="Used in the program URL."
                />

                <Select
                  label="Category"
                  required
                  value={form.category}
                  onChange={(value) => updateField("category", value)}
                  options={categories}
                />
              </div>

              <Input
                label="Short description"
                value={form.shortDescription}
                onChange={(value) =>
                  updateField("shortDescription", value)
                }
                placeholder="A short summary of this financing opportunity"
              />

              <TextArea
                label="Description"
                required
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe the financing program, its purpose, benefits and application process..."
                rows={6}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Sector"
                  value={form.sector}
                  onChange={(value) => updateField("sector", value)}
                  placeholder="e.g. Technology, Agriculture, Industry"
                />

                <Select
                  label="Funding type"
                  value={form.fundingType}
                  onChange={(value) => updateField("fundingType", value)}
                  options={[
                    { value: "", label: "Select funding type" },
                    ...fundingTypes.map((type) => ({
                      value: type,
                      label: type,
                    })),
                  ]}
                />
              </div>
            </div>
          </section>

          {/* FUNDING */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Wallet className="h-5 w-5" />}
              title="Funding"
              description="Define the financial support available."
            />

            <div className="grid gap-6 p-6 md:grid-cols-3">
              <Input
                label="Minimum funding amount"
                required
                type="number"
                min="0"
                value={form.amountMin}
                onChange={(value) => updateField("amountMin", value)}
                placeholder="100000"
              />

              <Input
                label="Maximum funding amount"
                required
                type="number"
                min="0"
                value={form.amountMax}
                onChange={(value) => updateField("amountMax", value)}
                placeholder="5000000"
              />

              <Select
                label="Currency"
                required
                value={form.currency}
                onChange={(value) => updateField("currency", value)}
                options={currencies.map((currency) => ({
                  value: currency,
                  label: currency,
                }))}
              />
            </div>
          </section>

          {/* DATES */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<CalendarDays className="h-5 w-5" />}
              title="Program Dates"
              description="Set the period during which the program is available."
            />

            <div className="grid gap-6 p-6 md:grid-cols-2">
              <Input
                label="Opening date"
                type="date"
                value={form.openingDate}
                onChange={(value) => updateField("openingDate", value)}
              />

              <Input
                label="Closing date"
                type="date"
                value={form.closingDate}
                onChange={(value) => updateField("closingDate", value)}
              />
            </div>
          </section>

          {/* TARGET & ELIGIBILITY */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<MapPin className="h-5 w-5" />}
              title="Target & Eligibility"
              description="Specify who can benefit from this program and under which conditions."
            />

            <div className="space-y-6 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Region"
                  value={form.region}
                  onChange={(value) => updateField("region", value)}
                  placeholder="e.g. All Algeria, Sétif, Algiers"
                />

                <Input
                  label="Target audience"
                  value={form.targetAudience}
                  onChange={(value) =>
                    updateField("targetAudience", value)
                  }
                  placeholder="e.g. Women entrepreneurs, Startups"
                />
              </div>

              <ArrayField
                title="Eligibility criteria"
                description="Add the conditions an entrepreneur must meet."
                items={eligibility}
                placeholder="e.g. Business registered in Algeria"
                onChange={(index, value) =>
                  updateArrayItem("eligibility", index, value)
                }
                onAdd={() => addArrayItem("eligibility")}
                onRemove={(index) =>
                  removeArrayItem("eligibility", index)
                }
              />

              <ArrayField
                title="Required documents"
                description="List documents applicants must provide."
                items={requiredDocuments}
                placeholder="e.g. Business registration certificate"
                onChange={(index, value) =>
                  updateArrayItem("requiredDocuments", index, value)
                }
                onAdd={() => addArrayItem("requiredDocuments")}
                onRemove={(index) =>
                  removeArrayItem("requiredDocuments", index)
                }
              />
            </div>
          </section>

          {/* CONTACT */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<Globe className="h-5 w-5" />}
              title="Contact Information"
              description="Give entrepreneurs ways to learn more or contact the institution."
            />

            <div className="grid gap-6 p-6">
              <Input
                label="Website"
                type="url"
                value={form.website}
                onChange={(value) => updateField("website", value)}
                placeholder="https://example.dz"
                icon={<Globe className="h-4 w-4" />}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) => updateField("email", value)}
                  placeholder="contact@example.dz"
                  icon={<Mail className="h-4 w-4" />}
                />

                <Input
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  onChange={(value) => updateField("phone", value)}
                  placeholder="+213 ..."
                  icon={<Phone className="h-4 w-4" />}
                />
              </div>
            </div>
          </section>

          {/* PUBLICATION */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeader
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Publication"
              description="Control the visibility of your program."
            />

            <div className="space-y-4 p-6">
              <Toggle
                label="Published"
                description="Visible to entrepreneurs when published."
                checked={form.isPublished}
                onChange={(value) =>
                  updateField("isPublished", value)
                }
              />

              <Toggle
                label="Archived"
                description="Archived programs are no longer active."
                checked={form.isArchived}
                onChange={(value) =>
                  updateField("isArchived", value)
                }
              />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/institution/programs")}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Program
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  icon,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  icon?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          min={min}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 ${
            icon ? "pl-10" : ""
          }`}
        />
      </div>

      {hint && (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function ArrayField({
  title,
  description,
  items,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  items: string[];
  placeholder: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(index, e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              aria-label={`Remove ${title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-violet-600 transition hover:bg-violet-50"
        >
          <Plus className="h-4 w-4" />
          Add another
        </button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
    >
      <div>
        <div className="text-sm font-semibold text-slate-800">{label}</div>
        <div className="mt-1 text-xs text-slate-500">{description}</div>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-violet-600" : "bg-slate-300"
        }`}
      >
        <div
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </div>
    </button>
  );
}