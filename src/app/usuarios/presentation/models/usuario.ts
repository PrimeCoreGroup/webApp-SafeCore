export type RolUsuario = "Administrator" | "Operator" | "Responder" | "Resident";
export type EstadoUsuario = "activo" | "inactivo";

export type Usuario = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol: RolUsuario | null;
  estado: EstadoUsuario;
};

// Datos para crear un usuario (el backend asigna el estado activo)
export type UsuarioNuevo = {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  rol: RolUsuario;
};

// Datos que el backend permite cambiar de un usuario existente
export type UsuarioCambios = {
  nombres: string;
  apellidos: string;
  estado: EstadoUsuario;
};

export const ROL_LABEL: Record<RolUsuario, string> = {
  Administrator: "Administrador",
  Operator: "Operador",
  Responder: "Responsable de seguridad",
  Resident: "Residente",
};

export const ROL_DESCRIPCION: Record<RolUsuario, string> = {
  Administrator: "Gestiona la plataforma web y los usuarios.",
  Operator: "Instala y registra nodos desde la app móvil.",
  Responder: "Consulta alertas y el estado de los nodos del edificio.",
  Resident: "Ve el nodo de su piso o casa desde la app móvil.",
};

export function nombreCompleto(usuario: Pick<Usuario, "nombres" | "apellidos">): string {
  return `${usuario.nombres} ${usuario.apellidos}`.trim();
}
