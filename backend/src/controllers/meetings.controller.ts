import { Response } from "express";
import * as svc from "../services/meetings.service";
import { notifyMeetingScheduled } from "../services/notifications.service";
import * as R from "../utils/response";
import { AuthenticatedRequest } from "../types";

// Local interface to type participant items safely
interface MeetingParticipant {
  user: {
    id: string;
    [key: string]: unknown;
  };
}

export async function createMeeting(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { title, platform, meetingUrl, scheduledAt, notes, participantIds } = req.body as {
      title: string;
      platform: string;
      meetingUrl: string;
      scheduledAt: string;
      notes?: string;
      participantIds: string[];
    };

    if (!title || !platform || !meetingUrl || !scheduledAt || !Array.isArray(participantIds) || participantIds.length === 0) {
      R.badRequest(res, "Titre, plateforme, lien, date et au moins un membre invité sont requis");
      return;
    }

    const meeting = await svc.createMeeting(req.user!.id, {
      title,
      platform,
      meetingUrl,
      scheduledAt,
      notes,
      participantIds,
    });

    // Notify every invited entrepreneur so they can open it from their notifications.
    await Promise.all(
      meeting.participants.map((p: MeetingParticipant) =>
        notifyMeetingScheduled(p.user.id, req.user!.name, meeting.title, meeting.id)
      )
    );

    R.created(res, meeting, "Réunion créée et invitations envoyées");
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NO_PARTICIPANTS") {
      R.badRequest(res, "Sélectionnez au moins un membre à inviter");
      return;
    }
    console.error(err);
    R.serverError(res);
  }
}

export async function listMyMeetings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const meetings = await svc.listMyMeetings(req.user!.id);
    R.ok(res, meetings);
  } catch (err: unknown) {
    console.error(err);
    R.serverError(res);
  }
}

export async function getMeeting(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const meeting = await svc.getMeeting(String(req.params.id), req.user!.id);
    R.ok(res, meeting);
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") return void R.notFound(res);
      if (err.message === "FORBIDDEN") return void R.forbidden(res);
    }
    R.serverError(res);
  }
}