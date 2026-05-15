import type { ItineraryRequestDto, ItineraryResponseDto } from "./itinerary.dto";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
  }
}

const toAppError = async (res: Response): Promise<AppError> => {
  try {
    const body = (await res.json()) as { error?: { code?: string; message?: string } };
    const code = body.error?.code ?? "UNKNOWN_ERROR";
    const message = body.error?.message ?? res.statusText;
    return new AppError(message, res.status, code);
  } catch {
    return new AppError(res.statusText, res.status, "UNKNOWN_ERROR");
  }
};

export const itineraryApi = {
  create: async (body: ItineraryRequestDto): Promise<ItineraryResponseDto> => {
    const res = await fetch(`${API_BASE_URL}/api/itinerary`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await toAppError(res);
    const { data } = (await res.json()) as { data: ItineraryResponseDto };
    return data;
  },

  getById: async (id: string): Promise<ItineraryResponseDto> => {
    const res = await fetch(`${API_BASE_URL}/api/itinerary/${id}`);
    if (!res.ok) throw await toAppError(res);
    const { data } = (await res.json()) as { data: ItineraryResponseDto };
    return data;
  },
};
