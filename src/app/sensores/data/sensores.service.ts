import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { mockInmuebles, mockNodos, mockZonas } from "@/app/ubicaciones/presentation/data/mock-ubicaciones";
import { mockSensores } from "../presentation/data/mock-sensores";
import { SENSOR_TIPOS } from "../presentation/config/sensor-ui";
import type { Lectura, Sensor, SensorInput } from "../presentation/models/sensor";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.
// En modo mock los cambios se guardan solo en memoria (se pierden al recargar).
let sensoresMock: Sensor[] = structuredClone(mockSensores);

function toSensor(input: SensorInput, previous?: Sensor): Sensor {
  const inmueble = mockInmuebles.find((i) => i.id === input.inmuebleId);
  const zona = mockZonas.find((z) => z.id === input.zonaId);
  const nodo = mockNodos.find((n) => n.id === input.nodoId);
  return {
    id: input.id,
    nombre: input.nombre,
    tipo: input.tipo,
    inmuebleId: input.inmuebleId,
    inmuebleNombre: inmueble?.nombre ?? "",
    zonaId: input.zonaId,
    zonaNombre: zona?.nombre ?? "",
    nodoId: input.nodoId,
    nodoNombre: nodo?.nombre ?? "",
    ultimaLectura: previous?.ultimaLectura ?? null,
    estado: input.estado,
    conectividad: previous?.conectividad ?? "Sin conexión",
    ultimaComunicacion: previous?.ultimaComunicacion ?? "Sin comunicación",
    umbralMin: input.umbralMin,
    umbralMax: input.umbralMax,
  };
}

// GET /api/v1/sensors
export async function getSensores(): Promise<Sensor[]> {
  if (USE_MOCKS) return mockResponse(sensoresMock);
  return api.get<Sensor[]>("/api/v1/sensors");
}

// GET /api/v1/sensors/{id}
export async function getSensor(id: string): Promise<Sensor> {
  if (USE_MOCKS) {
    const sensor = sensoresMock.find((s) => s.id === id);
    if (!sensor) throw new Error("Sensor no encontrado");
    return mockResponse(sensor);
  }
  return api.get<Sensor>(`/api/v1/sensors/${id}`);
}

// GET /api/v1/sensors/{id}/readings
export async function getLecturasSensor(id: string): Promise<Lectura[]> {
  if (USE_MOCKS) {
    const sensor = sensoresMock.find((s) => s.id === id);
    const base = Number.parseFloat(sensor?.ultimaLectura ?? "");
    const unidad = sensor ? SENSOR_TIPOS[sensor.tipo].unidad : null;
    if (!sensor || Number.isNaN(base) || !unidad) return mockResponse([]);
    const lecturas = [5, 10, 15, 20, 25, 30].map((minutos, i) => ({
      fecha: `Hace ${minutos} min`,
      valor: `${(base + (i % 2 === 0 ? 0.4 : -0.3) * (i + 1) * (base > 5 ? 1 : 0.01)).toFixed(base > 5 ? 0 : 2)} ${unidad}`,
    }));
    return mockResponse(lecturas);
  }
  return api.get<Lectura[]>(`/api/v1/sensors/${id}/readings`);
}

// POST /api/v1/sensors
export async function createSensor(input: SensorInput): Promise<Sensor> {
  if (USE_MOCKS) {
    if (sensoresMock.some((s) => s.id === input.id)) {
      throw new Error("Ya existe un sensor con ese identificador");
    }
    const sensor = toSensor(input);
    sensoresMock = [...sensoresMock, sensor];
    return mockResponse(sensor);
  }
  return api.post<Sensor>("/api/v1/sensors", input);
}

// PUT /api/v1/sensors/{id}
export async function updateSensor(id: string, input: SensorInput): Promise<Sensor> {
  if (USE_MOCKS) {
    const previous = sensoresMock.find((s) => s.id === id);
    if (!previous) throw new Error("Sensor no encontrado");
    const sensor = toSensor({ ...input, id }, previous);
    sensoresMock = sensoresMock.map((s) => (s.id === id ? sensor : s));
    return mockResponse(sensor);
  }
  return api.put<Sensor>(`/api/v1/sensors/${id}`, input);
}

// DELETE /api/v1/sensors/{id}
export async function deleteSensor(id: string): Promise<void> {
  if (USE_MOCKS) {
    sensoresMock = sensoresMock.filter((s) => s.id !== id);
    return mockResponse(undefined);
  }
  return api.delete<void>(`/api/v1/sensors/${id}`);
}

// POST /api/v1/sensors/{id}/test — prueba del dispositivo sin generar alerta real (US14)
export async function probarSensor(id: string): Promise<void> {
  if (USE_MOCKS) return mockResponse(undefined, 900);
  return api.post<void>(`/api/v1/sensors/${id}/test`, {});
}
