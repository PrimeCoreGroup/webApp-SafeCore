import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { mockUsuarios } from "../presentation/data/mock-usuarios";
import type { Usuario, UsuarioInput } from "../presentation/models/usuario";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.
// En modo mock los cambios se guardan solo en memoria (se pierden al recargar).
let usuariosMock: Usuario[] = structuredClone(mockUsuarios);

// GET /api/v1/users
export async function getUsuarios(): Promise<Usuario[]> {
  if (USE_MOCKS) return mockResponse(usuariosMock);
  return api.get<Usuario[]>("/api/v1/users");
}

// GET /api/v1/users/{id}
export async function getUsuario(id: string): Promise<Usuario> {
  if (USE_MOCKS) {
    const usuario = usuariosMock.find((u) => u.id === id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return mockResponse(usuario);
  }
  return api.get<Usuario>(`/api/v1/users/${id}`);
}

// POST /api/v1/users
export async function createUsuario(input: UsuarioInput): Promise<Usuario> {
  if (USE_MOCKS) {
    if (usuariosMock.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Ya existe un usuario con ese correo");
    }
    const usuario: Usuario = { id: `usr-${crypto.randomUUID().slice(0, 8)}`, ...input };
    usuariosMock = [...usuariosMock, usuario];
    return mockResponse(usuario);
  }
  return api.post<Usuario>("/api/v1/users", input);
}

// PUT /api/v1/users/{id}
export async function updateUsuario(id: string, input: UsuarioInput): Promise<Usuario> {
  if (USE_MOCKS) {
    const usuario: Usuario = { id, ...input };
    usuariosMock = usuariosMock.map((u) => (u.id === id ? usuario : u));
    return mockResponse(usuario);
  }
  return api.put<Usuario>(`/api/v1/users/${id}`, input);
}
