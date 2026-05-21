import type { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
import { BadRequestError } from "../../middlewares/error-handler.middleware.js";
import { getPreferencesQuerySchema, type SavePreferencesDto } from "./preferences.dto.js";
import {
  findPreferencesByEmail,
  upsertPreferences,
} from "./preferences.repository.js";

export const preferencesController = {
  save: asyncHandler(async (req: Request, res: Response) => {
    const dto = req.body as SavePreferencesDto;
    const saved = await upsertPreferences(dto);
    res.json({ data: saved });
  }),

  get: asyncHandler(async (req: Request, res: Response) => {
    const parsed = getPreferencesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }
    const found = await findPreferencesByEmail(parsed.data.email);
    res.json({ data: found });
  }),
};
