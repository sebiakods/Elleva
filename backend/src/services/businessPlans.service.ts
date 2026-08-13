import prisma from "../config/database";
import { BusinessPlanStatus } from "../types";

// ─── Entrepreneur: own plans ──────────────────────────────────────────────────
export async function listMyPlans(ownerId: string) {
  return prisma.businessPlan.findMany({
    where: { ownerId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, status: true,
      progress: true, createdAt: true, updatedAt: true,
      reviewScore: true, reviewedAt: true, reviewNotes: true,
    },
  });
}

export async function getPlan(id: string, requesterId: string, requesterRole: string) {
  const plan = await prisma.businessPlan.findUnique({
    where: { id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  if (!plan) throw new Error("NOT_FOUND");

  const isOwner  = plan.ownerId === requesterId;
  const isExpert = requesterRole === "EXPERT";
  const isAdmin  = requesterRole === "ADMIN";

  if (!isOwner && !isExpert && !isAdmin) throw new Error("FORBIDDEN");
  return plan;
}

export async function createPlan(ownerId: string, title: string) {
  return prisma.businessPlan.create({
    data: { title, ownerId },
    select: { id: true, title: true, status: true, progress: true, createdAt: true },
  });
}

export async function updatePlan(
  id: string,
  ownerId: string,
  data: {
    title?: string; progress?: number;
    executiveSummary?: object; marketAnalysis?: object;
    strategy?: object; financialPlan?: object;
  }
) {
  const plan = await prisma.businessPlan.findUnique({ where: { id } });
  if (!plan)              throw new Error("NOT_FOUND");
  if (plan.ownerId !== ownerId) throw new Error("FORBIDDEN");
  if (plan.status === BusinessPlanStatus.APPROVED) throw new Error("LOCKED");

  return prisma.businessPlan.update({ where: { id }, data });
}

export async function submitPlan(id: string, ownerId: string) {
  const plan = await prisma.businessPlan.findUnique({ where: { id } });
  if (!plan)              throw new Error("NOT_FOUND");
  if (plan.ownerId !== ownerId) throw new Error("FORBIDDEN");
  if (plan.status !== BusinessPlanStatus.DRAFT) throw new Error("ALREADY_SUBMITTED");

  return prisma.businessPlan.update({
    where: { id },
    data: { status: BusinessPlanStatus.SUBMITTED },
  });
}

export async function deletePlan(id: string, ownerId: string) {
  const plan = await prisma.businessPlan.findUnique({ where: { id } });
  if (!plan)              throw new Error("NOT_FOUND");
  if (plan.ownerId !== ownerId) throw new Error("FORBIDDEN");
  if (plan.status === BusinessPlanStatus.APPROVED) throw new Error("LOCKED");

  await prisma.businessPlan.delete({ where: { id } });
}

// ─── Expert: review queue ─────────────────────────────────────────────────────
export async function listSubmittedPlans(params: {
  skip: number;
  limit: number;
  view?: "pending" | "completed";
  expertId?: string;
}) {
  const where =
    params.view === "completed"
      ? {
          status: { in: [BusinessPlanStatus.APPROVED, BusinessPlanStatus.REJECTED] },
          ...(params.expertId ? { reviewedById: params.expertId } : {}),
        }
      : {
          status: { in: [BusinessPlanStatus.SUBMITTED, BusinessPlanStatus.IN_REVIEW] },
        };

  const [plans, total] = await Promise.all([
    prisma.businessPlan.findMany({
      where,
      skip: params.skip,
      take: params.limit,
      orderBy: { updatedAt: params.view === "completed" ? "desc" : "asc" },
      include: { owner: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    }),
    prisma.businessPlan.count({ where }),
  ]);

  return { plans, total };
}

export async function reviewPlan(
  id: string,
  expertId: string,
  data: { score: number; notes: string; status: "APPROVED" | "REJECTED" }
) {
  const plan = await prisma.businessPlan.findUnique({ where: { id } });
  if (!plan) throw new Error("NOT_FOUND");

  return prisma.businessPlan.update({
    where: { id },
    data: {
      status: data.status,
      reviewScore: data.score,
      reviewNotes: data.notes,
      reviewedById: expertId,
      reviewedAt: new Date(),
    },
  });
}