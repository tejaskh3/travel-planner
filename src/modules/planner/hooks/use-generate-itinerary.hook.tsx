"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AppError, itineraryApi } from "@/api/itinerary/itinerary.api";
import type { ItineraryRequestDto, ItineraryResponseDto } from "@/api/itinerary/itinerary.dto";
import { inrToUsd } from "@/lib/currency.util";
import type { CityKey, Pace } from "@/api/itinerary/itinerary.enum";
import type { TGroupKey, TStyleKey } from "../planner.constants";
import { stylesToPrefs } from "../util/styles-to-prefs.util";

type GenerateArgs = {
  cityKey: CityKey;
  days: number;
  budgetInr: number;
  styles: TStyleKey[];
  pace: Pace;
  group: TGroupKey;
};

const buildPrefillQuery = (args: GenerateArgs): string => {
  const params = new URLSearchParams({
    city: args.cityKey,
    days: String(args.days),
    budget: String(args.budgetInr),
    styles: args.styles.join(","),
    pace: args.pace,
    group: args.group,
  });
  return params.toString();
};

export const useGenerateItinerary = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<ItineraryResponseDto, AppError, GenerateArgs>({
    mutationFn: async (args) => {
      const body: ItineraryRequestDto = {
        cityKey: args.cityKey,
        days: args.days,
        budgetUsd: inrToUsd(args.budgetInr),
        preferences: stylesToPrefs(args.styles),
        pace: args.pace,
      };
      return itineraryApi.create(body);
    },
    onSuccess: (data, args) => {
      queryClient.setQueryData(["itinerary", data.id], data);
      const query = buildPrefillQuery(args);
      router.push(`/itinerary/${data.id}?${query}`);
    },
  });
};
