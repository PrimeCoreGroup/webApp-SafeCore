import type { Usuario } from "../models/usuario";

export const mockUsuarios: Usuario[] = [
  { id: "usr-1", nombres: "Alex", apellidos: "Rivera", email: "alex.rivera@safecore.com", rol: "Administrator", estado: "activo" },
  { id: "usr-2", nombres: "María", apellidos: "López", email: "maria.lopez@safecore.com", rol: "Operator", estado: "activo" },
  { id: "usr-3", nombres: "Carlos", apellidos: "Méndez", email: "carlos.mendez@safecore.com", rol: "Responder", estado: "activo" },
  { id: "usr-4", nombres: "Ana", apellidos: "Torres", email: "ana.torres@safecore.com", rol: "Resident", estado: "inactivo" },
];
