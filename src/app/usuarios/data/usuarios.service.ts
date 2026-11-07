import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { mockUsuarios } from "../presentation/data/mock-usuarios";
import type {
  EstadoUsuario,
  RolUsuario,
  Usuario,
  UsuarioCambios,
  UsuarioNuevo,
} from "../presentation/models/usuario";

// Usa Users; con VITE_USE_MOCKS=true usa datos de ejemplo.

type UserApi = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: "Active" | "Disabled";
  roles: string[];
};

const ROLES: RolUsuario[] = ["Administrator", "Operator", "Responder", "Resident"];

function estadoDesdeApi(status: string): EstadoUsuario {
  return status === "Disabled" ? "inactivo" : "activo";
}

function usuarioDesdeApi(user: UserApi): Usuario {
  return {
    id: user.id,
    nombres: user.firstName,
    apellidos: user.lastName,
    email: user.email,
    rol: ROLES.find((rol) => user.roles.includes(rol)) ?? null,
    estado: estadoDesdeApi(user.status),
  };
}

let usuariosMock: Usuario[] = structuredClone(mockUsuarios);

// GET /api/users
export async function getUsuarios(): Promise<Usuario[]> {
  if (isMock("usuarios")) return mockResponse(usuariosMock);
  return (await api.get<UserApi[]>("/api/users")).map(usuarioDesdeApi);
}

// GET /api/users/{id}
export async function getUsuario(id: string): Promise<Usuario> {
  if (isMock("usuarios")) {
    const usuario = usuariosMock.find((u) => u.id === id);
    if (!usuario) throw new Error("Usuario no encontrado");
    return mockResponse(usuario);
  }
  return usuarioDesdeApi(await api.get<UserApi>(`/api/users/${id}`));
}

// POST /api/users
export async function createUsuario(input: UsuarioNuevo): Promise<Usuario> {
  if (isMock("usuarios")) {
    if (usuariosMock.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Ya existe un usuario con ese correo.");
    }
    const { password: _password, ...datos } = input;
    const usuario: Usuario = { id: `usr-${crypto.randomUUID().slice(0, 8)}`, ...datos, estado: "activo" };
    usuariosMock = [...usuariosMock, usuario];
    return mockResponse(usuario);
  }
  const user = await api.post<UserApi>("/api/users", {
    email: input.email,
    password: input.password,
    firstName: input.nombres,
    lastName: input.apellidos,
    role: input.rol,
  });
  return usuarioDesdeApi(user);
}

// PUT /api/users/{id} (solo nombre, apellido y estado; responde 204)
export async function updateUsuario(id: string, cambios: UsuarioCambios): Promise<Usuario> {
  if (isMock("usuarios")) {
    const actual = usuariosMock.find((u) => u.id === id);
    if (!actual) throw new Error("Usuario no encontrado");
    const usuario: Usuario = { ...actual, ...cambios };
    usuariosMock = usuariosMock.map((u) => (u.id === id ? usuario : u));
    return mockResponse(usuario);
  }
  await api.put<void>(`/api/users/${id}`, {
    firstName: cambios.nombres,
    lastName: cambios.apellidos,
    status: cambios.estado === "activo" ? "Active" : "Disabled",
  });
  return getUsuario(id);
}
