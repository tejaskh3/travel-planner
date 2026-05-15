import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { BadRequestError } from "./error-handler.middleware.js";

export const validateBody =
  <T extends ZodSchema>(schema: T): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join(".") || "body"}: ${firstIssue.message}`
        : "Invalid request body";
      return next(new BadRequestError(message));
    }
    req.body = parsed.data;
    next();
  };
