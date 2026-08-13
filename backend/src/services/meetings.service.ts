import prisma from "../config/database";

export async function createMeeting(
  expertId: string,
  data: {
    title: string;
    platform: string;
    meetingUrl: string;
    scheduledAt: string;
    notes?: string;
    participantIds: string[];
  }
) {
  if (!data.participantIds.length) {
    throw new Error("NO_PARTICIPANTS");
  }

  return prisma.meeting.create({
    data: {
      title: data.title,
      platform: data.platform,
      meetingUrl: data.meetingUrl,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes || null,
      expertId,
      participants: {
        create: data.participantIds.map((userId) => ({ userId })),
      },
    },
    include: {
      expert: { select: { id: true, name: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });
}

export async function listMyMeetings(userId: string) {
  return prisma.meeting.findMany({
    where: {
      OR: [{ expertId: userId }, { participants: { some: { userId } } }],
    },
    orderBy: { scheduledAt: "asc" },
    include: {
      expert: { select: { id: true, name: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });
}

export async function getMeeting(id: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      expert: { select: { id: true, name: true, email: true, avatarUrl: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      },
    },
  });
  if (!meeting) throw new Error("NOT_FOUND");

  const isExpert = meeting.expertId === userId;
  const isParticipant = meeting.participants.some((p) => p.userId === userId);
  if (!isExpert && !isParticipant) throw new Error("FORBIDDEN");

  return meeting;
}