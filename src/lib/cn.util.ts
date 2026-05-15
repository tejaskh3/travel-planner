import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export const BRAND_GRADIENT =
  "linear-gradient(135deg, #5B5BF0 0%, #8B5CF6 55%, #B364F0 100%)";

export const BRAND_GRADIENT_SOFT =
  "linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)";
