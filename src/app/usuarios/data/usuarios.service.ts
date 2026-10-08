import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { normalizar } from "@/lib/format";
import { mockUsuarios } from "../presentation/data/mock-usuarios";
import type { EstadoUsuario, Usuario, UsuarioInput } from "../presentation/models/usuario";

// Usa Users; con VITE_USE_MOCKS=true usa datos de ejemplo.

type UserApi = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  status: string;
};

// El backend exige texto no vacío; se envía un relleno hasta que exista login
const PASSWORD_PENDIENTE = "pendiente-autenticacion";

const STATUS_INACTIVO = ["inactive", "inactivo", "disabled", "blocked"];

function estadoDesdeApi(status: string): EstadoUsuario {
  return STATUS_INACTIVO.includes(normalizar(status)) ? "inactivo" : "activo";
}

// El backend no maneja roles
function usuarioDesdeApi(user: UserApi): Usuario {
  return {
    id: user.id,
    nombre: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    rol: null,
    estado: estadoDesdeApi(user.status),
  };
}

// "Ana María Torres" -> "Ana" y "María Torres"
function separarNombre(nombre: string): { firstName: string; lastName: string } {
  const [firstName = "", ...resto] = nombre.trim().split(/\s+/);
  return { firstName, lastName: resto.join(" ") || "-" };
}

function bodyDesdeInput(input: UsuarioInput, passwordHash: string) {
  return {
    email: input.email,
    ...separarNombre(input.nombre),
    passwordHash,
    status: input.estado === "activo" ? "active" : "inactive",
  };
}

let usuariosMock: Usuario[] = structuredClone(mockUsuarios);

// GET /api/Users
export async function getUsuarios(): Promise<Usuario[]> {
  if (isMock("usuarios")) return mockResponse(usuariosMock);
  return (await api.get<UserApi[]>("/api/Users")).map(usuarioDesdeApi);
}

// GET /api/Users/{id}
export async function getUsuario(id: string): Promise<Usuario> {
  if (isMock("usuarios")) {
    const usuario = usuariosMock.find((u) => u.id === id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return mockResponse(usuario);
  }
  return usuarioDesdeApi(await api.get<UserApi>(`/api/Users/${id}`));
}

// POST /api/Users
export async function createUsuario(input: UsuarioInput): Promise<Usuario> {
  if (isMock("usuarios")) {
    if (usuariosMock.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Ya existe un usuario con ese correo");
    }
    const usuario: Usuario = { id: `usr-${crypto.randomUUID().slice(0, 8)}`, ...input };
    usuariosMock = [...usuariosMock, usuario];
    return mockResponse(usuario);
  }
  return usuarioDesdeApi(await api.post<UserApi>("/api/Users", bodyDesdeInput(input, PASSWORD_PENDIENTE)));
}

// PUT /api/Users/{id} (conserva el passwordHash actual)
export async function updateUsuario(id: string, input: UsuarioInput): Promise<Usuario> {
  if (isMock("usuarios")) {
    const usuario: Usuario = { id, ...input };
    usuariosMock = usuariosMock.map((u) => (u.id === id ? usuario : u));
    return mockResponse(usuario);
  }
  const actual = await api.get<UserApi>(`/api/Users/${id}`);
  await api.put<void>(`/api/Users/${id}`, bodyDesdeInput(input, actual.passwordHash));
  return getUsuario(id);
}
