import { z } from "zod";
import type { HealthStatus, Product, User } from "@v19/types";

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  fullName: z.string().nullable(),
  avatarUrl: z.url().nullable(),
  locale: z.enum(["es", "en"]),
  createdAt: z.string(),
}) satisfies z.ZodType<User>;

export const productSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().nonnegative(),
  currency: z.string().length(3),
  imageUrl: z.url().nullable(),
}) satisfies z.ZodType<Product>;

export const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
}) satisfies z.ZodType<HealthStatus>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
export type LoginInput = z.infer<typeof loginSchema>;

export { z };
