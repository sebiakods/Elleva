import { Response } from "express";
import * as svc from "../services/entrepreneurs.service";
import * as R from "../utils/response";
import { AuthenticatedRequest } from "../types";

export async function listMyEntrepreneurs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const entrepreneurs = await svc.listMyEntrepreneurs(req.user!.id);
    R.ok(res, entrepreneurs);
  } catch (err) {
    console.error(err);
    R.serverError(res);
  }
}