import { prisma } from "../prisma";
import { ApplicationStatus } from "@prisma/client";

export type AnalyticsPeriod = "3m" | "6m" | "12m";

const MONTH_LABELS_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

// Statuses counted as "engaged" money for the "Montants engagés par
// programme" chart. Change this if "engaged" should mean something
// narrower — e.g. only ApplicationStatus.APPROVED for strictly
// committed/approved funds.
const ENGAGED_STATUSES = new Set<ApplicationStatus>([
  ApplicationStatus.SUBMITTED,
  ApplicationStatus.UNDER_REVIEW,
  ApplicationStatus.APPROVED,
  ApplicationStatus.WAITLISTED,
]);

function getMonthsForPeriod(period: AnalyticsPeriod): number {
  switch (period) {
    case "3m":
      return 3;
    case "12m":
      return 12;
    case "6m":
    default:
      return 6;
  }
}

async function getInstitutionProfileId(userId: string): Promise<string> {
  const profile = await prisma.institutionProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw Object.assign(new Error("Institution profile not found"), {
      statusCode: 404,
    });
  }

  return profile.id;
}

export async function getInstitutionAnalytics(
  userId: string,
  period: AnalyticsPeriod = "6m"
) {
  const institutionProfileId = await getInstitutionProfileId(userId);

  const months = getMonthsForPeriod(period);
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  // DRAFT applications aren't really "received" yet, so we exclude them.
  const applications = await prisma.application.findMany({
    where: {
      program: { institutionProfileId },
      createdAt: { gte: rangeStart },
      status: { not: ApplicationStatus.DRAFT },
    },
    select: {
      status: true,
      amountRequested: true,
      createdAt: true,
      program: { select: { title: true, sector: true } },
    },
  });

  // ---- Applications by month --------------------------------------------
  const monthBuckets: {
    key: string;
    month: string;
    candidatures: number;
    approuvees: number;
  }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: MONTH_LABELS_FR[d.getMonth()],
      candidatures: 0,
      approuvees: 0,
    });
  }
  const bucketByKey = new Map(monthBuckets.map((b) => [b.key, b]));

  for (const app of applications) {
    const key = `${app.createdAt.getFullYear()}-${app.createdAt.getMonth()}`;
    const bucket = bucketByKey.get(key);
    if (!bucket) continue;
    bucket.candidatures += 1;
    if (app.status === ApplicationStatus.APPROVED) {
      bucket.approuvees += 1;
    }
  }

  const applicationsByMonth = monthBuckets.map(
    ({ month, candidatures, approuvees }) => ({ month, candidatures, approuvees })
  );

  // ---- Amounts engaged by program -----------------------------------------
  const amountByProgram = new Map<string, number>();
  for (const app of applications) {
    if (!ENGAGED_STATUSES.has(app.status)) continue;
    const title = app.program.title;
    amountByProgram.set(title, (amountByProgram.get(title) ?? 0) + Number(app.amountRequested));
  }

  const amountsByProgram = Array.from(amountByProgram.entries())
    .map(([program, montant]) => ({ program, montant }))
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 8);

  // ---- Status breakdown ---------------------------------------------------
  const statusCounts = {
    APPROVED: 0,
    UNDER_REVIEW: 0,
    SUBMITTED: 0,
    WAITLISTED: 0,
    REJECTED: 0,
  };

  for (const app of applications) {
    switch (app.status) {
      case ApplicationStatus.APPROVED:
        statusCounts.APPROVED += 1;
        break;
      case ApplicationStatus.UNDER_REVIEW:
        statusCounts.UNDER_REVIEW += 1;
        break;
      case ApplicationStatus.SUBMITTED:
        statusCounts.SUBMITTED += 1;
        break;
      case ApplicationStatus.WAITLISTED:
        statusCounts.WAITLISTED += 1;
        break;
      case ApplicationStatus.REJECTED:
        statusCounts.REJECTED += 1;
        break;
      default:
        break;
    }
  }

  const statusBreakdown = [
    { name: "Financées", value: statusCounts.APPROVED, color: "#be123c" },
    { name: "En cours", value: statusCounts.UNDER_REVIEW, color: "#d97706" },
    {
      name: "En attente",
      value: statusCounts.SUBMITTED + statusCounts.WAITLISTED,
      color: "#0369a1",
    },
    { name: "Refusées", value: statusCounts.REJECTED, color: "#94a3b8" },
  ];

  // ---- Sector breakdown -----------------------------------------------
  const sectorCounts = new Map<string, number>();
  for (const app of applications) {
    const sector = app.program.sector?.trim() || "Autres";
    sectorCounts.set(sector, (sectorCounts.get(sector) ?? 0) + 1);
  }

  const sectorBreakdown = Array.from(sectorCounts.entries())
    .map(([sector, value]) => ({ sector, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // ---- Totals -----------------------------------------------------------
  const totalApplications = applications.length;
  const totalApproved = statusCounts.APPROVED;
  const conversionRate =
    totalApplications > 0 ? Math.round((totalApproved / totalApplications) * 100) : 0;
  const totalAmount = amountsByProgram.reduce((sum, p) => sum + p.montant, 0);

  return {
    applicationsByMonth,
    amountsByProgram,
    statusBreakdown,
    sectorBreakdown,
    totals: { totalApplications, totalApproved, conversionRate, totalAmount },
  };
}