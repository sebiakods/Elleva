import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { badRequest } from "../utils/response";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      badRequest(res, "Données invalides", details);
      return;
    }
    req.body = result.data; // use coerced/sanitised data
    next();
  };
}