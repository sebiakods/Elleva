import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/expert/calendar?month=6&year=2026
 * Returns all calendar notes for the logged-in expert.
 * If month/year are provided, filters to that month (month is 0-indexed).
 */
export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!expertProfile) {
      return res.status(404).json({ error: "Profil expert introuvable." });
    }

    const { month, year } = req.query;

    let dateFilter = {};
    if (month !== undefined && year !== undefined) {
      const m = Number(month);
      const y = Number(year);
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 1);
      dateFilter = { date: { gte: start, lt: end } };
    }

    const events = await prisma.expertCalendarEvent.findMany({
      where: {
        expertProfileId: expertProfile.id,
        ...dateFilter,
      },
      orderBy: { date: "asc" },
    });

    return res.json({ events });
  } catch (err) {
    console.error("getCalendarEvents error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

/**
 * POST /api/expert/calendar
 * body: { title: string, description?: string, date: string (ISO), allDay?: boolean }
 * Creates a new note on the expert's calendar, on whatever date the expert picked.
 * No booking/messaging involved.
 */
export const createCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, date, allDay } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: "Le titre et la date sont requis." });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Date invalide." });
    }

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!expertProfile) {
      return res.status(404).json({ error: "Profil expert introuvable." });
    }

    const event = await prisma.expertCalendarEvent.create({
      data: {
        expertProfileId: expertProfile.id,
        title,
        description: description || null,
        date: parsedDate,
        allDay: allDay ?? true,
      },
    });

    return res.status(201).json({ event });
  } catch (err) {
    console.error("createCalendarEvent error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

/**
 * PATCH /api/expert/calendar/:id
 * Updates a note owned by the logged-in expert.
 */
export const updateCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    const { title, description, date, allDay } = req.body;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!expertProfile) {
      return res.status(404).json({ error: "Profil expert introuvable." });
    }

    const existing = await prisma.expertCalendarEvent.findUnique({ where: { id } });
    if (!existing || existing.expertProfileId !== expertProfile.id) {
      return res.status(404).json({ error: "Note introuvable." });
    }

    let parsedDate: Date | undefined;
    if (date !== undefined) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Date invalide." });
      }
    }

    const event = await prisma.expertCalendarEvent.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(parsedDate !== undefined && { date: parsedDate }),
        ...(allDay !== undefined && { allDay }),
      },
    });

    return res.json({ event });
  } catch (err) {
    console.error("updateCalendarEvent error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};

/**
 * DELETE /api/expert/calendar/:id
 * Deletes a note owned by the logged-in expert.
 */
export const deleteCalendarEvent = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const expertProfile = await prisma.expertProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!expertProfile) {
      return res.status(404).json({ error: "Profil expert introuvable." });
    }

    const existing = await prisma.expertCalendarEvent.findUnique({ where: { id } });
    if (!existing || existing.expertProfileId !== expertProfile.id) {
      return res.status(404).json({ error: "Note introuvable." });
    }

    await prisma.expertCalendarEvent.delete({ where: { id } });

    return res.status(204).send();
  } catch (err) {
    console.error("deleteCalendarEvent error:", err);
    return res.status(500).json({ error: "Erreur serveur." });
  }
};