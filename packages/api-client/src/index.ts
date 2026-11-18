import type { HealthStatus, Product } from "@v19/types";
import { healthSchema, productSchema, z } from "@v19/validators";

export interface ApiClientOptions {
  baseUrl: string;
  /** Devuelve el JWT de Supabase (o null) para la cabecera Authorization. */
  getToken?: () => Promise<string | null> | string | null;
  fetch?: typeof fetch;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export function createApiClient({ baseUrl, getToken, fetch: f = fetch }: ApiClientOptions) {
  async function request<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}): Promise<T> {
    const token = getToken ? await getToken() : null;
    const res = await f(`${baseUrl.replace(/\/$/, "")}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
    if (!res.ok) throw new ApiClientError(res.status, await res.text());
    return schema.parse(await res.json());
  }

  return {
    health: (): Promise<HealthStatus> => request("/health", healthSchema),
    products: {
      list: (): Promise<Product[]> => request("/api/v1/products", z.array(productSchema)),
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
