import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { getNodosMock } from "@/app/nodos/data/nodos.service";
import type { Nodo } from "@/app/nodos/presentation/models/nodo";
import { mockInmuebles, mockZonas } from "../presentation/data/mock-ubicaciones";
import type { EstadoUbicacion, Inmueble, Zona } from "../presentation/models/ubicacion";

// Datos de ejemplo (el backend no tiene ubicaciones). Los endpoints son supuestos.

function estadoDe(nodos: Nodo[]): EstadoUbicacion {
  return nodos.some((n) => n.estado !== "online") ? "atencion" : "operativo";
}

// Contadores y estado salen de los nodos de ejemplo
async function buildInmuebles(): Promise<Inmueble[]> {
  const nodos = getNodosMock();
  return mockInmuebles.map((inmueble) => {
    const delInmueble = nodos.filter((n) => n.inmuebleId === inmueble.id);
    const zonas: Zona[] = mockZonas
      .filter((z) => z.inmuebleId === inmueble.id)
      .map((z) => {
        const deZona = delInmueble.filter((n) => n.zonaId === z.id);
        return { ...z, nodos: deZona.length, estado: estadoDe(deZona) };
      });
    return {
      ...inmueble,
      zonas,
      nodos: delInmueble.length,
      nodosEnLinea: delInmueble.filter((n) => n.estado === "online").length,
      estado: estadoDe(delInmueble),
    };
  });
}

// GET /api/v1/properties
export async function getInmuebles(): Promise<Inmueble[]> {
  if (isMock("ubicaciones")) return mockResponse(await buildInmuebles(), 0);
  return api.get<Inmueble[]>("/api/v1/properties");
}

// GET /api/v1/properties/{id}
export async function getInmueble(id: string): Promise<Inmueble> {
  if (isMock("ubicaciones")) {
    const inmueble = (await buildInmuebles()).find((i) => i.id === id);
    if (!inmueble) throw new Error("Inmueble no encontrado");
    return mockResponse(inmueble);
  }
  return api.get<Inmueble>(`/api/v1/properties/${id}`);
}

export type ZonaDetalle = { zona: Zona; inmueble: Inmueble; nodos: Nodo[] };

// GET /api/v1/properties/{inmuebleId}/zones/{zonaId}
export async function getZona(inmuebleId: string, zonaId: string): Promise<ZonaDetalle> {
  if (isMock("ubicaciones")) {
    const inmueble = (await buildInmuebles()).find((i) => i.id === inmuebleId);
    const zona = inmueble?.zonas.find((z) => z.id === zonaId);
    if (!inmueble || !zona) throw new Error("Zona no encontrada");
    const nodos = getNodosMock().filter((n) => n.zonaId === zonaId);
    return mockResponse({ zona, inmueble, nodos });
  }
  return api.get<ZonaDetalle>(`/api/v1/properties/${inmuebleId}/zones/${zonaId}`);
}
