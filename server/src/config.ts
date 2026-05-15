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
});

const parsed = configSchema.safeParse({
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT ?? 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof configSchema>;
