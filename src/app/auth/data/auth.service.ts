import { api, mockResponse, USE_MOCKS } from "@/lib/api";

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

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.
// En modo mock cualquier correo y contraseña no vacíos inician sesión como administrador.

// POST /api/v1/auth/login
export async function loginRequest(credentials: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCKS) {
    return mockResponse({
      token: "mock-token",
      user: { id: 1, name: "Alex Rivera", email: credentials.email, role: "ADMIN" },
    });
  }
  return api.post<LoginResponse>("/api/v1/auth/login", credentials);
}
