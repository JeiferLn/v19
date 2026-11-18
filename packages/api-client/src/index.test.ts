import { describe, expect, it, vi } from "vitest";

import { ApiClientError, createApiClient } from "./index";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("createApiClient", () => {
  it("llama a la URL correcta y envía el token como Bearer", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse({ status: "ok", version: "1" }));
    const api = createApiClient({
      baseUrl: "http://api.test/",
      getToken: () => "jwt-123",
      fetch: fetchMock,
    });

    await expect(api.health()).resolves.toEqual({ status: "ok", version: "1" });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://api.test/health");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer jwt-123");
  });

  it("no envía Authorization si no hay token", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => jsonResponse([]));
    const api = createApiClient({
      baseUrl: "http://api.test",
      getToken: async () => null,
      fetch: fetchMock,
    });

    await api.products.list();

    expect(new Headers(fetchMock.mock.calls[0]![1]?.headers).has("Authorization")).toBe(false);
  });

  it("lanza ApiClientError con el status si la respuesta no es ok", async () => {
    const api = createApiClient({
      baseUrl: "http://api.test",
      fetch: async () => new Response("no autorizado", { status: 401 }),
    });

    await expect(api.health()).rejects.toMatchObject({ name: "ApiClientError", status: 401 });
    await expect(api.health()).rejects.toBeInstanceOf(ApiClientError);
  });

  it("rechaza respuestas que no cumplen el contrato zod", async () => {
    const api = createApiClient({
      baseUrl: "http://api.test",
      fetch: async () => jsonResponse([{ id: "x", title: "", price: -1 }]),
    });

    await expect(api.products.list()).rejects.toThrow();
  });
});
