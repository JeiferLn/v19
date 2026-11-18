import { describe, expect, it } from "vitest";

import { healthSchema, loginSchema, productSchema, userSchema } from "./index";

const product = {
  id: "demo-1",
  title: "Producto",
  description: null,
  price: 19.9,
  currency: "EUR",
  imageUrl: null,
};

describe("productSchema", () => {
  it("acepta un producto válido", () => {
    expect(productSchema.parse(product)).toEqual(product);
  });

  it.each([
    ["título vacío", { title: "" }],
    ["precio negativo", { price: -1 }],
    ["moneda de longitud distinta de 3", { currency: "EURO" }],
    ["imageUrl que no es URL", { imageUrl: "no-es-url" }],
  ])("rechaza %s", (_name, override) => {
    expect(productSchema.safeParse({ ...product, ...override }).success).toBe(false);
  });
});

describe("userSchema", () => {
  it("valida email y locale", () => {
    const user = {
      id: "u1",
      email: "a@b.co",
      fullName: null,
      avatarUrl: null,
      locale: "es",
      createdAt: "2026-11-18T00:00:00Z",
    };
    expect(userSchema.safeParse(user).success).toBe(true);
    expect(userSchema.safeParse({ ...user, email: "x" }).success).toBe(false);
    expect(userSchema.safeParse({ ...user, locale: "fr" }).success).toBe(false);
  });
});

describe("healthSchema y loginSchema", () => {
  it("health exige status ok", () => {
    expect(healthSchema.safeParse({ status: "ok", version: "1" }).success).toBe(true);
    expect(healthSchema.safeParse({ status: "down", version: "1" }).success).toBe(false);
  });

  it("login exige contraseña de al menos 8 caracteres (igual que Supabase Auth)", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "1234567" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.co", password: "12345678" }).success).toBe(true);
  });
});
