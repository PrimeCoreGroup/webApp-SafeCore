import type { NodoEdge } from "../models/ubicacion";

// Catálogo base; contadores y estado se derivan de los sensores
export type InmuebleBase = { id: string; nombre: string; direccion: string };
export type ZonaBase = { id: string; inmuebleId: string; nombre: string };

export const mockInmuebles: InmuebleBase[] = [
  { id: "inm-1", nombre: "Sede Principal", direccion: "Av. Central 245" },
  { id: "inm-2", nombre: "Torre Norte", direccion: "Calle Seguridad 118" },
  { id: "inm-3", nombre: "Edificio Central", direccion: "Av. Protección 560" },
];

export const mockZonas: ZonaBase[] = [
  { id: "z-1-1", inmuebleId: "inm-1", nombre: "Piso 3 · Oficinas" },
  { id: "z-1-2", inmuebleId: "inm-1", nombre: "Piso 2 · Salas" },
  { id: "z-1-3", inmuebleId: "inm-1", nombre: "Piso 1 · Recepción" },
  { id: "z-1-4", inmuebleId: "inm-1", nombre: "Estacionamiento" },
  { id: "z-2-1", inmuebleId: "inm-2", nombre: "Piso 3" },
  { id: "z-2-2", inmuebleId: "inm-2", nombre: "Piso 1" },
  { id: "z-3-1", inmuebleId: "inm-3", nombre: "Recepción" },
  { id: "z-3-2", inmuebleId: "inm-3", nombre: "Entrada principal" },
  { id: "z-3-3", inmuebleId: "inm-3", nombre: "Sótano" },
];

export const mockNodos: NodoEdge[] = [
  { id: "nodo-1", nombre: "Nodo Edge 01", inmuebleId: "inm-1", bateria: 92, conectividad: "online" },
  { id: "nodo-4", nombre: "Nodo Edge 04", inmuebleId: "inm-1", bateria: 64, conectividad: "online" },
  { id: "nodo-2", nombre: "Nodo Edge 02", inmuebleId: "inm-2", bateria: 78, conectividad: "online" },
  { id: "nodo-3", nombre: "Nodo Edge 03", inmuebleId: "inm-3", bateria: 85, conectividad: "online" },
];
