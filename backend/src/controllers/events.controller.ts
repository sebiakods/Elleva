// backend/src/controllers/events.controller.ts
import { Request, Response, NextFunction } from "express";
import * as eventsService from "../services/events.service";

/**
 * Helper to safely resolve route params as a single string
 */
function getParamId(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param ?? "";
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const event = await eventsService.createEvent(userId, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function listInstitutionEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const { query, type, status } = req.query as {
      query?: string;
      type?: string;
      status?: "all" | "upcoming" | "past";
    };
    const events = await eventsService.listInstitutionEvents(userId, { query, type, status });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

export async function getEventById(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const id = getParamId(req.params.id);
    const event = await eventsService.getEventById(userId, id);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const id = getParamId(req.params.id);
    const event = await eventsService.updateEvent(userId, id, req.body);
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const id = getParamId(req.params.id);
    const result = await eventsService.deleteEvent(userId, id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function publishEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    const id = getParamId(req.params.id);
    const event = await eventsService.updateEvent(userId, id, {
      isPublished: req.body.isPublished ?? true,
    });
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function listPublicEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { query, type } = req.query as { query?: string; type?: string };
    const events = await eventsService.listPublicEvents({ query, type });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}