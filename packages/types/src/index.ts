export type ID = string;

export interface User {
  id: ID;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  locale: "es" | "en";
  createdAt: string;
}

export interface Product {
  id: ID;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface HealthStatus {
  status: "ok";
  version: string;
}
