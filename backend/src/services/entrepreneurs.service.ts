import prisma from "../config/database";

export async function listMyEntrepreneurs(expertId: string) {
  const [plans, sessions] = await Promise.all([
    prisma.businessPlan.findMany({
      where: { reviewedById: expertId },
      select: {
        id: true,
        title: true,
        status: true,
        reviewScore: true,
        updatedAt: true,
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.session.findMany({
      where: { expertId },
      select: {
        id: true,
        topic: true,
        status: true,
        scheduledAt: true,
        entrepreneur: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { scheduledAt: "desc" },
    }),
  ]);

  type EntrepreneurEntry = {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    businessPlans: { id: string; title: string; status: string; reviewScore: number | null; updatedAt: Date }[];
    sessions: { id: string; topic: string; status: string; scheduledAt: Date }[];
    lastActivity: Date;
  };

  const map = new Map<string, EntrepreneurEntry>();

  function ensure(u: { id: string; name: string; email: string; avatarUrl: string | null }) {
    if (!map.has(u.id)) {
      map.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email,
        avatarUrl: u.avatarUrl,
        businessPlans: [],
        sessions: [],
        lastActivity: new Date(0),
      });
    }
    return map.get(u.id)!;
  }

  for (const p of plans) {
    const entry = ensure(p.owner);
    entry.businessPlans.push({
      id: p.id,
      title: p.title,
      status: p.status,
      reviewScore: p.reviewScore,
      updatedAt: p.updatedAt,
    });
    if (p.updatedAt > entry.lastActivity) entry.lastActivity = p.updatedAt;
  }

  for (const s of sessions) {
    const entry = ensure(s.entrepreneur);
    entry.sessions.push({ id: s.id, topic: s.topic, status: s.status, scheduledAt: s.scheduledAt });
    if (s.scheduledAt > entry.lastActivity) entry.lastActivity = s.scheduledAt;
  }

  return Array.from(map.values()).sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}