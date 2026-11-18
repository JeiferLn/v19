import { z } from "@v19/validators";

/**
 * Variables públicas que necesitan web y mobile. Son las mismas en ambas apps; solo cambia el
 * prefijo (`NEXT_PUBLIC_` / `EXPO_PUBLIC_`). Nunca deben contener secretos.
 */
export const publicEnvSchema = z.object({
  apiUrl: z.url({ message: "debe ser una URL válida (p. ej. http://localhost:8000)" }),
  supabaseUrl: z.url({ message: "debe ser una URL válida (p. ej. http://127.0.0.1:54321)" }),
  supabaseAnonKey: z.string().min(1, { message: "es obligatoria (ver `supabase status`)" }),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export type PublicEnvPrefix = "NEXT_PUBLIC_" | "EXPO_PUBLIC_";

/** Valores crudos tal como los entrega el bundler (pueden faltar). */
export interface RawPublicEnv {
  apiUrl: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
}

const envNames: Record<keyof RawPublicEnv, string> = {
  apiUrl: "API_URL",
  supabaseUrl: "SUPABASE_URL",
  supabaseAnonKey: "SUPABASE_ANON_KEY",
};

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

/**
 * Valida las variables públicas de una app. Las apps deben leer cada variable con su nombre
 * literal (`process.env.NEXT_PUBLIC_API_URL`) para que Next/Expo las incrusten en el bundle; por eso
 * esta función recibe los valores ya leídos en lugar de acceder a `process.env`.
 */
export function parsePublicEnv(raw: RawPublicEnv, prefix: PublicEnvPrefix): PublicEnv {
  const result = publicEnvSchema.safeParse(raw);
  if (result.success) return result.data;

  const lines = result.error.issues.map((issue) => {
    const key = issue.path[0] as keyof RawPublicEnv;
    return `  - ${prefix}${envNames[key]}: ${issue.message}`;
  });
  throw new EnvValidationError(
    `Variables de entorno inválidas:\n${lines.join("\n")}\n` +
      `Copia el .env.example de la app a .env.local y complétalo.`,
  );
}
