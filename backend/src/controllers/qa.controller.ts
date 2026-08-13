import { Response } from "express";
import * as svc from "../services/qa.service";
import { notifyQuestionAnswered } from "../services/notifications.service";
import * as R from "../utils/response";
import { AuthenticatedRequest } from "../types";

export async function askQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { question, category } = req.body as { question: string; category: string };
    if (!question?.trim() || !category?.trim()) {
      R.badRequest(res, "La question et la catégorie sont requises");
      return;
    }
    const created = await svc.askQuestion(req.user!.id, question.trim(), category.trim());
    R.created(res, created, "Question envoyée");
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function listMyQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const questions = await svc.listMyQuestions(req.user!.id);
    R.ok(res, questions);
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function listAllQuestions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const answeredParam = req.query.answered;
    const answered =
      answeredParam === "true" ? true : answeredParam === "false" ? false : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const questions = await svc.listAllQuestions({ answered, search });
    R.ok(res, questions);
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}

export async function answerQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { answer } = req.body as { answer: string };
    if (!answer?.trim() || answer.trim().length < 5) {
      R.badRequest(res, "La réponse doit contenir au moins 5 caractères");
      return;
    }

    const updated = await svc.answerQuestion(String(req.params.id), req.user!.id, answer.trim());

    await notifyQuestionAnswered(updated.asker.id, req.user!.name, updated.id);

    R.ok(res, updated, "Réponse publiée");
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.message === "NOT_FOUND") return void R.notFound(res);
      if (err.message === "ALREADY_ANSWERED") return void R.badRequest(res, "Cette question a déjà une réponse");
    }
    console.error(err);
    R.serverError(res);
  }
}

export async function voteQuestion(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const updated = await svc.voteQuestion(String(req.params.id));
    R.ok(res, updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NOT_FOUND") return void R.notFound(res);
    console.error(err);
    R.serverError(res);
  }
}