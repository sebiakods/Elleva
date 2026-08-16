// backend/src/services/events.service.ts
import { PrismaClient, EventType, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Types & Enum Mappings                                             */
/* ------------------------------------------------------------------ */

export type EventFormat = "en_ligne" | "presentiel";

export type CreateEventInput = {
  title: string;
  description: string;
  type: string; // frontend enum
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  format: EventFormat;
  location?: string;
  meetingLink?: string;
  capacity?: number | null;
  speaker?: string | null;
  isPublished: boolean;
};

export const FRONTEND_TO_PRISMA_TYPE: Record<string, EventType> = {
  webinaire: "WEBINAR",
  atelier: "WORKSHOP",
  seance_information: "INFO_SESSION",
};

export const PRISMA_TO_FRONTEND_TYPE: Record<EventType, string> = {
  WEBINAR: "webinaire",
  WORKSHOP: "atelier",
  CONFERENCE: "atelier",
  INFO_SESSION: "seance_information",
  OTHER: "seance_information",
};

/* ------------------------------------------------------------------ */
/* Location Packing Helpers                                           */
/* ------------------------------------------------------------------ */

/* locationOrUrl packs the format in a prefix since there's no
   dedicated `format` column yet: "online:<url>" | "inperson:<address>" */

function packLocation(format: EventFormat, value: string): string {
  return `${format === "en_ligne" ? "online" : "inperson"}:${value}`;
}

function unpackLocation(locationOrUrl: string): { format: EventFormat; value: string } {
  const isOnline = locationOrUrl.startsWith("online:");
  const isInPerson = locationOrUrl.startsWith("inperson:");
  const value = isOnline || isInPerson ? locationOrUrl.split(":").slice(1).join(":") : locationOrUrl;
  return {
    format: isInPerson ? "presentiel" : "en_ligne",
    value,
  };
}

/* ------------------------------------------------------------------ */
/* Shape returned to the frontend                                     */
/* ------------------------------------------------------------------ */

function toClientShape(event: any) {
  const { format, value } = unpackLocation(event.locationOrUrl ?? "");
  const now = new Date();
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    type: PRISMA_TO_FRONTEND_TYPE[event.type as EventType] ?? "seance_information",
    status: event.scheduledAt < now ? "past" : "upcoming", // no CANCELLED column yet
    date: event.scheduledAt.toISOString().slice(0, 10),
    time: event.scheduledAt.toISOString().slice(11, 16),
    format,
    location: format === "presentiel" ? value : "En ligne",
    meetingLink: format === "en_ligne" ? value : null,
    online: format === "en_ligne",
    capacity: event.capacity,
    registered: event.registeredCount ?? 0,
    speaker: event.speaker ?? null,
    isPublished: event.isPublished,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

export async function getInstitutionProfileIdForUser(userId: string): Promise<string> {
  const profile = await prisma.institutionProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    const err: any = new Error("Institution profile not found for this user");
    err.statusCode = 404;
    throw err;
  }
  return profile.id;
}

/* ------------------------------------------------------------------ */
/* CRUD                                                               */
/* ------------------------------------------------------------------ */

export async function createEvent(userId: string, input: CreateEventInput) {
  const institutionProfileId = await getInstitutionProfileIdForUser(userId);

  const scheduledAt = new Date(`${input.date}T${input.time}:00`);
  if (isNaN(scheduledAt.getTime())) {
    const err: any = new Error("Invalid date/time");
    err.statusCode = 400;
    throw err;
  }

  const locationOrUrl = packLocation(
    input.format,
    input.format === "en_ligne" ? input.meetingLink ?? "" : input.location ?? ""
  );

  const event = await prisma.institutionEvent.create({
    data: {
      title: input.title,
      description: input.description,
      type: FRONTEND_TO_PRISMA_TYPE[input.type] ?? "OTHER",
      scheduledAt,
      locationOrUrl,
      capacity: input.capacity ?? null,
      isPublished: input.isPublished,
      institutionProfileId,
    },
  });

  return toClientShape({ ...event, speaker: input.speaker ?? null });
}

export async function listInstitutionEvents(
  userId: string,
  filters: { query?: string; type?: string; status?: "all" | "upcoming" | "past" }
) {
  const institutionProfileId = await getInstitutionProfileIdForUser(userId);

  const where: Prisma.InstitutionEventWhereInput = { institutionProfileId };

  if (filters.query) {
    where.title = { contains: filters.query, mode: "insensitive" };
  }
  if (filters.type && filters.type !== "all") {
    where.type = FRONTEND_TO_PRISMA_TYPE[filters.type] ?? undefined;
  }
  if (filters.status === "upcoming") {
    where.scheduledAt = { gte: new Date() };
  } else if (filters.status === "past") {
    where.scheduledAt = { lt: new Date() };
  }

  const events = await prisma.institutionEvent.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
  });

  return events.map((e) => toClientShape(e));
}

export async function getEventById(userId: string, id: string) {
  const institutionProfileId = await getInstitutionProfileIdForUser(userId);
  const event = await prisma.institutionEvent.findFirst({
    where: { id, institutionProfileId },
  });
  if (!event) {
    const err: any = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  return toClientShape(event);
}

export async function updateEvent(userId: string, id: string, input: Partial<CreateEventInput>) {
  const institutionProfileId = await getInstitutionProfileIdForUser(userId);

  const existing = await prisma.institutionEvent.findFirst({
    where: { id, institutionProfileId },
  });
  if (!existing) {
    const err: any = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  const data: Prisma.InstitutionEventUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.type !== undefined) data.type = FRONTEND_TO_PRISMA_TYPE[input.type] ?? "OTHER";
  if (input.capacity !== undefined) data.capacity = input.capacity;
  if (input.isPublished !== undefined) data.isPublished = input.isPublished;

  if (input.date || input.time) {
    const dateStr = input.date ?? existing.scheduledAt.toISOString().slice(0, 10);
    const timeStr = input.time ?? existing.scheduledAt.toISOString().slice(11, 16);
    data.scheduledAt = new Date(`${dateStr}T${timeStr}:00`);
  }

  if (input.format || input.location !== undefined || input.meetingLink !== undefined) {
    const currentUnpacked = unpackLocation(existing.locationOrUrl);
    const format: EventFormat = input.format ?? currentUnpacked.format;
    const value =
      format === "en_ligne"
        ? input.meetingLink ?? currentUnpacked.value
        : input.location ?? currentUnpacked.value;
    data.locationOrUrl = packLocation(format, value);
  }

  const updated = await prisma.institutionEvent.update({ where: { id }, data });
  return toClientShape(updated);
}

export async function deleteEvent(userId: string, id: string) {
  const institutionProfileId = await getInstitutionProfileIdForUser(userId);
  const existing = await prisma.institutionEvent.findFirst({
    where: { id, institutionProfileId },
  });
  if (!existing) {
    const err: any = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }
  await prisma.institutionEvent.delete({ where: { id } });
  return { id };
}

/* ------------------------------------------------------------------ */
/* Public listing (entrepreneur-facing)                               */
/* ------------------------------------------------------------------ */

export async function listPublicEvents(filters: { query?: string; type?: string }) {
  const where: Prisma.InstitutionEventWhereInput = {
    isPublished: true,
    scheduledAt: { gte: new Date() },
  };
  if (filters.query) where.title = { contains: filters.query, mode: "insensitive" };
  if (filters.type && filters.type !== "all") {
    where.type = FRONTEND_TO_PRISMA_TYPE[filters.type] ?? undefined;
  }

  const events = await prisma.institutionEvent.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      institutionProfile: { select: { institutionName: true, logoUrl: true } },
    },
  });

  return events.map((e) => ({
    ...toClientShape(e),
    institutionName: e.institutionProfile.institutionName,
    institutionLogoUrl: e.institutionProfile.logoUrl,
  }));
}