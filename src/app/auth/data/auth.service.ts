import { api, mockResponse, type StoredUser } from "@/lib/api";
import { isMock } from "@/lib/data-sources";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: StoredUser;
};

type LoginApi = {
  token: { accessToken: string; tokenType: string; expiresInSeconds: number };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    mustChangePassword?: boolean;
  };
};

// POST /api/iam/auth/login
export async function loginRequest(credentials: LoginRequest): Promise<LoginResponse> {
  if (isMock("auth")) {
    return mockResponse({
      token: "mock-token",
      user: {
        id: "1",
        name: "Alex Rivera",
        email: credentials.email,
        roles: ["Administrator"],
        mustChangePassword: false,
      },
    });
  }
  const { token, user } = await api.post<LoginApi>("/api/iam/auth/login", credentials);
  return {
    token: token.accessToken,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      roles: user.roles,
      mustChangePassword: !!user.mustChangePassword,
    },
  };
}

// POST /api/iam/auth/change-password (responde 204; la sesión actual deja de ser válida)
export async function changePasswordRequest(currentPassword: string, newPassword: string): Promise<void> {
  if (isMock("auth")) return mockResponse(undefined);
  await api.post<void>("/api/iam/auth/change-password", { currentPassword, newPassword });
}
