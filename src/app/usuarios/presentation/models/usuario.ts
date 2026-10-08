export type RolUsuario = "ADMIN" | "PROPIETARIO" | "RESIDENTE";
export type EstadoUsuario = "activo" | "inactivo";

export type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
};

export type UsuarioInput = Omit<Usuario, "id">;

export const ROL_LABEL: Record<RolUsuario, string> = {
  ADMIN: "Administrador",
  PROPIETARIO: "Propietario",
  RESIDENTE: "Residente",
};
