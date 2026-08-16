import { prisma } from "../prisma";
import { ApplicationStatus } from "@prisma/client";

type BadgeTone = "wine" | "gold" | "rose" | "neutral";

// Helper: Safely retrieve institutionProfileId for a given userId
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

// ----------------------------------------------------------------------
// INSTITUTION OVERVIEW
// ----------------------------------------------------------------------
export async function getInstitutionOverview(userId: string) {
  const institutionProfileId = await getInstitutionProfileId(userId);
  const now = new Date();

  const [
    activePrograms,
    upcomingEvents,
    applications,
    distinctBeneficiaries,
    recentApplications,
  ] = await Promise.all([
    prisma.financingProgram.count({
      where: { institutionProfileId, isPublished: true, isArchived: false },
    }),

    prisma.institutionEvent.count({
      where: { institutionProfileId, isPublished: true, scheduledAt: { gte: now } },
    }),

    prisma.application.findMany({
      where: {
        program: { institutionProfileId },
        status: { not: ApplicationStatus.DRAFT },
      },
      select: { status: true },
    }),

    prisma.application.findMany({
      where: {
        program: { institutionProfileId },
        status: ApplicationStatus.APPROVED,
      },
      select: { applicantId: true },
      distinct: ["applicantId"],
    }),

    prisma.application.findMany({
      where: {
        program: { institutionProfileId },
        status: { not: ApplicationStatus.DRAFT },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        program: { select: { title: true } },
        applicant: { select: { name: true, avatarUrl: true } },
      },
    }),
  ]);

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

  const totalApplications = applications.length;

  function pct(count: number): number {
    return totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
  }

  const statusDistribution: { label: string; value: number; tone: BadgeTone }[] = [
    { label: "Approuvées", value: pct(statusCounts.APPROVED), tone: "rose" },
    { label: "En révision", value: pct(statusCounts.UNDER_REVIEW), tone: "gold" },
    {
      label: "En attente",
      value: pct(statusCounts.SUBMITTED + statusCounts.WAITLISTED),
      tone: "wine",
    },
    { label: "Refusées", value: pct(statusCounts.REJECTED), tone: "neutral" },
  ];

  return {
    stats: {
      activePrograms,
      totalApplications,
      upcomingEvents,
      totalBeneficiaries: distinctBeneficiaries.length,
    },
    statusDistribution,
    recentApplications: recentApplications.map((app) => ({
      id: app.id,
      applicantName: app.applicant.name,
      applicantAvatarUrl: app.applicant.avatarUrl,
      programTitle: app.program.title,
      status: app.status,
      createdAt: app.createdAt.toISOString(),
    })),
  };
}

// ----------------------------------------------------------------------
// ADMIN OVERVIEW
// ----------------------------------------------------------------------
export async function getAdminOverview() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsers30d,
    usersByRole,
    activePrograms,
    publishedEvents,
    submittedApplications,
    pendingApplications,
    submittedBusinessPlans,
    approvedBusinessPlans,
    recentUsers,
    usersLast6Months,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),

    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),

    prisma.financingProgram.count({
      where: { isPublished: true, isArchived: false },
    }),

    prisma.institutionEvent.count({
      where: { isPublished: true },
    }),

    prisma.application.count({
      where: { status: { not: ApplicationStatus.DRAFT } },
    }),

    prisma.application.count({
      where: {
        status: {
          in: [ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW],
        },
      },
    }),

    prisma.businessPlan.count({
      where: { status: "SUBMITTED" },
    }),

    prisma.businessPlan.count({
      where: { status: "APPROVED" },
    }),

    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),

    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  // ---- Role distribution ----
  const roleCounts: Record<string, number> = {
    ENTREPRENEUR: 0,
    EXPERT: 0,
    INSTITUTION: 0,
    ADMIN: 0,
  };
  for (const row of usersByRole) {
    roleCounts[row.role] = row._count._all;
  }

  const roleLabels: Record<string, string> = {
    ENTREPRENEUR: "Entrepreneures",
    EXPERT: "Mentores",
    INSTITUTION: "Institutions",
    ADMIN: "Admins",
  };

  const nonAdminTotal =
    roleCounts.ENTREPRENEUR + roleCounts.EXPERT + roleCounts.INSTITUTION;

  const roleDistribution = (["ENTREPRENEUR", "EXPERT", "INSTITUTION"] as const).map(
    (role) => ({
      label: roleLabels[role],
      count: roleCounts[role],
      pct: nonAdminTotal > 0 ? Math.round((roleCounts[role] / nonAdminTotal) * 100) : 0,
    })
  );

  // ---- Completion rate (approved / submitted business plans) ----
  const completionRate =
    submittedBusinessPlans + approvedBusinessPlans > 0
      ? Math.round(
          (approvedBusinessPlans /
            (submittedBusinessPlans + approvedBusinessPlans)) *
            100
        )
      : 0;

  // ---- Monthly activity chart (last 6 months, new user signups) ----
  const monthBuckets: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      count: 0,
    });
  }
  for (const u of usersLast6Months) {
    const key = `${u.createdAt.getFullYear()}-${u.createdAt.getMonth()}`;
    const bucket = monthBuckets.find((b) => b.key === key);
    if (bucket) bucket.count += 1;
  }

  return {
    analytics: {
      activeUsers: totalUsers,
      publishedPrograms: activePrograms,
      submittedBusinessPlans,
      completionRate,
    },
    quickActivity: {
      newSignups: newUsers30d,
      pendingRequests: pendingApplications,
      publishedContent: activePrograms + publishedEvents,
      actionsRequired: pendingApplications,
    },
    chart: monthBuckets.map((b) => ({ month: b.label, value: b.count })),
    roleDistribution,
    totalUsers,
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      createdAt: u.createdAt.toISOString(),
    })),
  };
}