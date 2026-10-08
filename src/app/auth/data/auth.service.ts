import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

// Datos de ejemplo (el backend no tiene login): cualquier credencial entra como administrador.

// POST /api/v1/auth/login
export async function loginRequest(credentials: LoginRequest): Promise<LoginResponse> {
  if (isMock("auth")) {
    return mockResponse({
      token: "mock-token",
      user: { id: 1, name: "Alex Rivera", email: credentials.email, role: "ADMIN" },
    });
  }
  return api.post<LoginResponse>("/api/v1/auth/login", credentials);
}
