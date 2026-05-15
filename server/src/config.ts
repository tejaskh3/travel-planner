import { z } from "zod";

try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional (production uses real env vars).
}

const configSchema = z.object({
  databaseUrl: z.string().url(),
  port: z.coerce.number().int().positive(),
  frontendOrigin: z.string().url(),
  openrouterApiKey: z.string().min(1).optional(),
  openrouterModel: z.string().min(1).default("openai/gpt-4o-mini"),
});

const blankToUndefined = (value: string | undefined): string | undefined =>
  value && value.length > 0 ? value : undefined;

const parsed = configSchema.safeParse({
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT ?? 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  openrouterApiKey: blankToUndefined(process.env.OPENROUTER_API_KEY),
  openrouterModel: blankToUndefined(process.env.OPENROUTER_MODEL),
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof configSchema>;
