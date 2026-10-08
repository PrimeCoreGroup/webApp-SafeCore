import type { Usuario } from "../models/usuario";

export const mockUsuarios: Usuario[] = [
  { id: "usr-1", nombre: "Alex Rivera", email: "alex.rivera@safecore.com", rol: "ADMIN", estado: "activo" },
  { id: "usr-2", nombre: "María López", email: "maria.lopez@safecore.com", rol: "PROPIETARIO", estado: "activo" },
  { id: "usr-3", nombre: "Carlos Méndez", email: "carlos.mendez@safecore.com", rol: "RESIDENTE", estado: "activo" },
  { id: "usr-4", nombre: "Ana Torres", email: "ana.torres@safecore.com", rol: "RESIDENTE", estado: "inactivo" },
];
