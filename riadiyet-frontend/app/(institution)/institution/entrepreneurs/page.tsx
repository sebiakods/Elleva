"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Mail,
  Landmark,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

type Status = "pending" | "in_progress" | "funded" | "rejected";

type Entrepreneur = {
  id: string;
  name: string;
  initials: string;
  sector: string;
  region: string;
  program: string;
  status: Status;
  progress: number;
  appliedDate: string;
  email: string;
};

const MOCK_ENTREPRENEURS: Entrepreneur[] = [
  {
    id: "1",
    name: "Amina Meziane",
    initials: "AM",
    sector: "Artisanat",
    region: "Sétif",
    program: "Programme Innovation Femmes 2026",
    status: "in_progress",
    progress: 65,
    appliedDate: "2026-05-12",
    email: "amina.meziane@example.dz",
  },
  {
    id: "2",
    name: "Sarah Boudiaf",
    initials: "SB",
    sector: "Numérique",
    region: "Alger",
    program: "Micro-crédit Numérique",
    status: "funded",
    progress: 100,
    appliedDate: "2026-04-03",
    email: "sarah.boudiaf@example.dz",
  },
  {
    id: "3",
    name: "Nour El Houda Kaci",
    initials: "NK",
    sector: "Agriculture",
    region: "Constantine",
    program: "Subvention Agri-Femmes",
    status: "pending",
    progress: 10,
    appliedDate: "2026-06-20",
    email: "nour.kaci@example.dz",
  },
  {
    id: "4",
    name: "Yasmine Belkacem",
    initials: "YB",
    sector: "Commerce",
    region: "Oran",
    program: "Prêt PME 2026",
    status: "rejected",
    progress: 0,
    appliedDate: "2026-03-28",
    email: "yasmine.belkacem@example.dz",
  },
  {
    id: "5",
    name: "Hana Cherif",
    initials: "HC",
    sector: "Santé",
    region: "Sétif",
    program: "Concours Santé & Innovation",
    status: "in_progress",
    progress: 40,
    appliedDate: "2026-06-01",
    email: "hana.cherif@example.dz",
  },
];

const STATUS_LABELS: Record<Status, string> = {
  pending: "En attente",
  in_progress: "En cours",
  funded: "Financée",
  rejected: "Refusée",
};

const STATUS_TONES: Record<Status, "gold" | "wine" | "rose"> = {
  pending: "gold",
  in_progress: "rose",
  funded: "wine",
  rejected: "rose",
};

const STATUS_ICONS: Record<Status, typeof Clock> = {
  pending: Clock,
  in_progress: TrendingUp,
  funded: CheckCircle2,
  rejected: XCircle,
};

export default function InstitutionEntrepreneursPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [sectorFilter, setSectorFilter] = useState("all");

  const sectors = useMemo(
    () => Array.from(new Set(MOCK_ENTREPRENEURS.map((e) => e.sector))),
    []
  );

  const filtered = useMemo(() => {
    return MOCK_ENTREPRENEURS.filter((e) => {
      const matchesQuery =
        query.trim() === "" ||
        e.name.toLowerCase().includes(query.trim().toLowerCase()) ||
        e.program.toLowerCase().includes(query.trim().toLowerCase());

      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      const matchesSector = sectorFilter === "all" || e.sector === sectorFilter;

      return matchesQuery && matchesStatus && matchesSector;
    });
  }, [query, statusFilter, sectorFilter]);

  const stats = useMemo(() => {
    const total = MOCK_ENTREPRENEURS.length;
    const funded = MOCK_ENTREPRENEURS.filter((e) => e.status === "funded").length;
    const pending = MOCK_ENTREPRENEURS.filter((e) => e.status === "pending").length;
    const approvalRate = total > 0 ? Math.round((funded / total) * 100) : 0;

    return { total, funded, pending, approvalRate };
  }, []);

  return (
    <>
      <Header title="Entrepreneures" />

      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Badge tone="rose">Portefeuille bénéficiaires</Badge>
          </div>

          

          <p className="mt-3 max-w-3xl text-ink-soft">
            Consultez les profils des entrepreneures ayant postulé à vos
            programmes. Suivez leur progression et accédez à leurs dossiers.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <Users size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Total</p>
                <p className="font-display text-2xl text-ink">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">En attente</p>
                <p className="font-display text-2xl text-ink">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Financées</p>
                <p className="font-display text-2xl text-ink">{stats.funded}</p>
              </div>
            </div>
          </Card>

          <Card hover={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Landmark size={20} />
              </div>
              <div>
                <p className="text-sm text-ink-soft">Taux d'approbation</p>
                <p className="font-display text-2xl text-ink">
                  {stats.approvalRate}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card hover={false}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <Input
                placeholder="Rechercher une entrepreneure ou un programme..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11"
              />
            </div>

            <Select
              label=""
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | Status)
              }
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="in_progress">En cours</option>
              <option value="funded">Financée</option>
              <option value="rejected">Refusée</option>
            </Select>

            <Select
              label=""
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
            >
              <option value="all">Tous les secteurs</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <Card hover={false}>
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100 text-ink-soft">
                <Users size={22} />
              </div>
              <p className="font-display text-xl text-ink">
                Aucune entrepreneure trouvée
              </p>
              <p className="max-w-md text-sm text-ink-soft">
                Essayez de modifier vos filtres ou votre recherche.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((entrepreneur) => {
              const StatusIcon = STATUS_ICONS[entrepreneur.status];

              return (
                <Card key={entrepreneur.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 font-display text-lg text-rose-700">
                        {entrepreneur.initials}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-ink">
                          {entrepreneur.name}
                        </h3>
                        <p className="text-sm text-ink-soft">
                          {entrepreneur.sector}
                        </p>
                      </div>
                    </div>

                    <Badge tone={STATUS_TONES[entrepreneur.status]}>
                      <span className="flex items-center gap-1.5">
                        <StatusIcon size={14} />
                        {STATUS_LABELS[entrepreneur.status]}
                      </span>
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-ink-soft">
                    <div className="flex items-center gap-2">
                      <Landmark size={14} />
                      {entrepreneur.program}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {entrepreneur.region}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Candidature du{" "}
                      {new Date(entrepreneur.appliedDate).toLocaleDateString(
                        "fr-FR"
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      {entrepreneur.email}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs text-ink-soft">
                      <span>Progression du dossier</span>
                      <span className="font-semibold text-ink">
                        {entrepreneur.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{ width: `${entrepreneur.progress}%` }}
                      />
                    </div>
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