import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { getSensores } from "@/app/sensores/data/sensores.service";
import type { Sensor } from "@/app/sensores/presentation/models/sensor";
import { mockInmuebles, mockNodos, mockZonas } from "../presentation/data/mock-ubicaciones";
import type { EstadoUbicacion, Inmueble, NodoEdge, Zona } from "../presentation/models/ubicacion";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.

function estadoDe(sensores: Sensor[]): EstadoUbicacion {
  return sensores.some((s) => s.estado !== "activo") ? "atencion" : "operativo";
}

// En modo mock los contadores y el estado se derivan de los sensores, para que todo sea consistente.
async function buildInmuebles(): Promise<Inmueble[]> {
  const sensores = await getSensores();
  return mockInmuebles.map((inmueble) => {
    const delInmueble = sensores.filter((s) => s.inmuebleId === inmueble.id);
    const zonas: Zona[] = mockZonas
      .filter((z) => z.inmuebleId === inmueble.id)
      .map((z) => {
        const deZona = delInmueble.filter((s) => s.zonaId === z.id);
        return { ...z, dispositivos: deZona.length, estado: estadoDe(deZona) };
      });
    return {
      ...inmueble,
      zonas,
      dispositivos: delInmueble.length,
      dispositivosConectados: delInmueble.filter((s) => s.estado !== "inactivo").length,
      estado: estadoDe(delInmueble),
    };
  });
}

// GET /api/v1/properties
export async function getInmuebles(): Promise<Inmueble[]> {
  if (USE_MOCKS) return mockResponse(await buildInmuebles(), 0);
  return api.get<Inmueble[]>("/api/v1/properties");
}

// GET /api/v1/properties/{id}
export async function getInmueble(id: string): Promise<Inmueble> {
  if (USE_MOCKS) {
    const inmueble = (await buildInmuebles()).find((i) => i.id === id);
    if (!inmueble) throw new Error("Inmueble no encontrado");
    return mockResponse(inmueble);
  }
  return api.get<Inmueble>(`/api/v1/properties/${id}`);
}

export type ZonaDetalle = { zona: Zona; inmueble: Inmueble; sensores: Sensor[] };

// GET /api/v1/properties/{inmuebleId}/zones/{zonaId}
export async function getZona(inmuebleId: string, zonaId: string): Promise<ZonaDetalle> {
  if (USE_MOCKS) {
    const inmueble = (await buildInmuebles()).find((i) => i.id === inmuebleId);
    const zona = inmueble?.zonas.find((z) => z.id === zonaId);
    if (!inmueble || !zona) throw new Error("Zona no encontrada");
    const sensores = (await getSensores()).filter((s) => s.zonaId === zonaId);
    return mockResponse({ zona, inmueble, sensores });
  }
  return api.get<ZonaDetalle>(`/api/v1/properties/${inmuebleId}/zones/${zonaId}`);
}

// GET /api/v1/nodes?propertyId={inmuebleId}
export async function getNodos(inmuebleId?: string): Promise<NodoEdge[]> {
  if (USE_MOCKS) {
    return mockResponse(mockNodos.filter((n) => !inmuebleId || n.inmuebleId === inmuebleId));
  }
  return api.get<NodoEdge[]>(`/api/v1/nodes${inmuebleId ? `?propertyId=${inmuebleId}` : ""}`);
}
