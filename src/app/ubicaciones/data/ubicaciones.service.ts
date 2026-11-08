import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { getNodos, getNodosMock } from "@/app/nodos/data/nodos.service";
import type { Nodo } from "@/app/nodos/presentation/models/nodo";
import { mockInmuebles, mockZonas } from "../presentation/data/mock-ubicaciones";
import type {
  EstadoUbicacion,
  Inmueble,
  InmuebleInput,
  Zona,
  ZonaInput,
} from "../presentation/models/ubicacion";

// Usa Properties y Zones; con VITE_USE_MOCKS=true usa datos de ejemplo.

type PropertyApi = { id: string; name: string; address: string };
type ZoneApi = { id: string; propertyId: string; name: string };
type DeviceResumenApi = { id: string; zoneId: string | null; propertyId: string | null; connectivityStatus: string };

type NodoResumen = { zonaId: string | null; inmuebleId: string | null; enLinea: boolean };

function estadoDe(nodos: NodoResumen[]): EstadoUbicacion {
  return nodos.some((n) => !n.enLinea) ? "atencion" : "operativo";
}

function armarInmuebles(
  inmuebles: { id: string; nombre: string; direccion: string }[],
  zonas: { id: string; inmuebleId: string; nombre: string }[],
  nodos: NodoResumen[],
): Inmueble[] {
  return inmuebles.map((inmueble) => {
    const delInmueble = nodos.filter((n) => n.inmuebleId === inmueble.id);
    const zonasDelInmueble: Zona[] = zonas
      .filter((z) => z.inmuebleId === inmueble.id)
      .map((z) => {
        const deZona = delInmueble.filter((n) => n.zonaId === z.id);
        return { ...z, nodos: deZona.length, estado: estadoDe(deZona) };
      });
    return {
      ...inmueble,
      zonas: zonasDelInmueble,
      nodos: delInmueble.length,
      nodosEnLinea: delInmueble.filter((n) => n.enLinea).length,
      estado: estadoDe(delInmueble),
    };
  });
}

async function inmueblesDesdeApi(): Promise<Inmueble[]> {
  const [propiedades, dispositivos] = await Promise.all([
    api.get<PropertyApi[]>("/api/properties?page=1&pageSize=250"),
    api.get<DeviceResumenApi[]>("/api/devices?page=1&pageSize=250").catch(() => [] as DeviceResumenApi[]),
  ]);
  const zonasPorInmueble = await Promise.all(
    propiedades.map((p) => api.get<ZoneApi[]>(`/api/properties/${p.id}/zones?page=1&pageSize=250`).catch(() => [] as ZoneApi[])),
  );
  return armarInmuebles(
    propiedades.map((p) => ({ id: p.id, nombre: p.name, direccion: p.address })),
    zonasPorInmueble.flat().map((z) => ({ id: z.id, inmuebleId: z.propertyId, nombre: z.name })),
    dispositivos.map((d) => ({ zonaId: d.zoneId, inmuebleId: d.propertyId, enLinea: d.connectivityStatus === "Online" })),
  );
}

function inmueblesDeEjemplo(): Inmueble[] {
  return armarInmuebles(
    mockInmuebles,
    mockZonas,
    getNodosMock().map((n) => ({ zonaId: n.zonaId, inmuebleId: n.inmuebleId, enLinea: n.estado === "online" })),
  );
}

// GET /api/properties, /api/properties/{id}/zones y /api/devices
export async function getInmuebles(): Promise<Inmueble[]> {
  if (isMock("ubicaciones")) return mockResponse(inmueblesDeEjemplo(), 0);
  return inmueblesDesdeApi();
}

export async function getInmueble(id: string): Promise<Inmueble> {
  const inmueble = (await getInmuebles()).find((i) => i.id === id);
  if (!inmueble) throw new Error("Inmueble no encontrado");
  return inmueble;
}

export type ZonaDetalle = { zona: Zona; inmueble: Inmueble; nodos: Nodo[] };

export async function getZona(inmuebleId: string, zonaId: string): Promise<ZonaDetalle> {
  const inmueble = await getInmueble(inmuebleId);
  const zona = inmueble.zonas.find((z) => z.id === zonaId);
  if (!zona) throw new Error("Zona no encontrada");
  const nodos = (await getNodos()).filter((n) => n.zonaId === zonaId);
  return { zona, inmueble, nodos };
}

// POST /api/properties
export async function createInmueble(input: InmuebleInput): Promise<void> {
  if (isMock("ubicaciones")) {
    mockInmuebles.push({ id: `inm-${crypto.randomUUID().slice(0, 8)}`, nombre: input.nombre, direccion: input.direccion });
    return mockResponse(undefined);
  }
  await api.post("/api/properties", { name: input.nombre, address: input.direccion });
}

// PUT /api/properties/{id}
export async function updateInmueble(id: string, input: InmuebleInput): Promise<void> {
  if (isMock("ubicaciones")) {
    const inmueble = mockInmuebles.find((i) => i.id === id);
    if (inmueble) Object.assign(inmueble, input);
    return mockResponse(undefined);
  }
  await api.put<void>(`/api/properties/${id}`, { name: input.nombre, address: input.direccion });
}

// DELETE /api/properties/{id}
export async function deleteInmueble(id: string): Promise<void> {
  if (isMock("ubicaciones")) {
    if (mockZonas.some((z) => z.inmuebleId === id)) {
      throw new Error("No se puede eliminar un inmueble con zonas o usuarios asignados.");
    }
    mockInmuebles.splice(mockInmuebles.findIndex((i) => i.id === id), 1);
    return mockResponse(undefined);
  }
  await api.delete<void>(`/api/properties/${id}`);
}

// POST /api/properties/{id}/zones
export async function createZona(inmuebleId: string, input: ZonaInput): Promise<void> {
  if (isMock("ubicaciones")) {
    mockZonas.push({ id: `z-${crypto.randomUUID().slice(0, 8)}`, inmuebleId, nombre: input.nombre });
    return mockResponse(undefined);
  }
  await api.post(`/api/properties/${inmuebleId}/zones`, { name: input.nombre });
}

// PUT /api/zones/{id}
export async function updateZona(id: string, input: ZonaInput): Promise<void> {
  if (isMock("ubicaciones")) {
    const zona = mockZonas.find((z) => z.id === id);
    if (zona) zona.nombre = input.nombre;
    return mockResponse(undefined);
  }
  await api.put<void>(`/api/zones/${id}`, { name: input.nombre });
}

// DELETE /api/zones/{id}
export async function deleteZona(id: string): Promise<void> {
  if (isMock("ubicaciones")) {
    if (getNodosMock().some((n) => n.zonaId === id)) {
      throw new Error("No se puede eliminar una zona con nodos o usuarios asignados.");
    }
    mockZonas.splice(mockZonas.findIndex((z) => z.id === id), 1);
    return mockResponse(undefined);
  }
  await api.delete<void>(`/api/zones/${id}`);
}
