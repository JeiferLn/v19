import { describe, expect, it } from "vitest";

import { EnvValidationError, parsePublicEnv } from "./index";

const valid = {
  apiUrl: "http://localhost:8000",
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseAnonKey: "anon-key",
};

describe("parsePublicEnv", () => {
  it("devuelve las variables cuando son válidas", () => {
    expect(parsePublicEnv(valid, "NEXT_PUBLIC_")).toEqual(valid);
  });

  it("falla con un mensaje que nombra cada variable inválida con su prefijo", () => {
    const run = () =>
      parsePublicEnv(
        { apiUrl: "no-es-url", supabaseUrl: undefined, supabaseAnonKey: "" },
        "EXPO_PUBLIC_",
      );
    expect(run).toThrow(EnvValidationError);
    expect(run).toThrow(/EXPO_PUBLIC_API_URL/);
    expect(run).toThrow(/EXPO_PUBLIC_SUPABASE_URL/);
    expect(run).toThrow(/EXPO_PUBLIC_SUPABASE_ANON_KEY/);
  });
});
