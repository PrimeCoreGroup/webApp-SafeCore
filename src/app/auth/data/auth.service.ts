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
  user: { id: string; email: string; firstName: string; lastName: string; roles: string[] };
};

// POST /api/iam/auth/login
export async function loginRequest(credentials: LoginRequest): Promise<LoginResponse> {
  if (isMock("auth")) {
    return mockResponse({
      token: "mock-token",
      user: { id: "1", name: "Alex Rivera", email: credentials.email, roles: ["Administrator"] },
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
    },
  };
}
