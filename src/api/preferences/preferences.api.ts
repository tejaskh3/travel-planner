import { AppError } from "@/api/itinerary/itinerary.api";
import type {
  PreferencesResDto,
  SavePreferencesReqDto,
} from "./preferences.dto";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

const toAppError = async (res: Response): Promise<AppError> => {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    const code = body.error?.code ?? "UNKNOWN_ERROR";
    const message = body.error?.message ?? res.statusText;
    return new AppError(message, res.status, code);
  } catch {
    return new AppError(res.statusText, res.status, "UNKNOWN_ERROR");
  }
};

export const preferencesApi = {
  save: async (body: SavePreferencesReqDto): Promise<PreferencesResDto> => {
    const res = await fetch(`${API_BASE_URL}/api/preferences`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await toAppError(res);
    const { data } = (await res.json()) as { data: PreferencesResDto };
    return data;
  },

  getByEmail: async (email: string): Promise<PreferencesResDto | null> => {
    const url = new URL(`${API_BASE_URL}/api/preferences`);
    url.searchParams.set("email", email);
    const res = await fetch(url.toString());
    if (!res.ok) throw await toAppError(res);
    const { data } = (await res.json()) as { data: PreferencesResDto | null };
    return data;
  },
};
