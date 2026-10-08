import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { formatFechaHora, normalizar, tiempoRelativo } from "@/lib/format";
import { mockInmuebles, mockNodos, mockZonas } from "@/app/ubicaciones/presentation/data/mock-ubicaciones";
import { mockSensores } from "../presentation/data/mock-sensores";
import { SENSOR_TIPOS } from "../presentation/config/sensor-ui";
import type { EstadoSensor, Lectura, Sensor, SensorInput, TipoSensor } from "../presentation/models/sensor";

// Usa Devices y SensorReadings; con VITE_USE_MOCKS=true usa datos de ejemplo.

type DeviceApi = {
  id: string;
  serialNumber: string;
  name: string;
  category: string;
  connectivityStatus: string;
};

type ReadingApi = {
  id: string;
  deviceId: string;
  sensorType: string;
  measuredValue: number;
  unit: string;
  capturedAt: string;
};

// Traduce valores libres del backend (español o inglés)
const CATEGORIA_A_TIPO: Record<string, TipoSensor> = {
  sismico: "sismico", seismic: "sismico", earthquake: "sismico",
  temperatura: "temperatura", temperature: "temperatura",
  humedad: "humedad", humidity: "humedad",
  gas: "gas",
  humo: "humo", smoke: "humo",
  movimiento: "movimiento", motion: "movimiento",
  sirena: "sirena", siren: "sirena",
  pulsador: "pulsador", button: "pulsador",
};

const ESTADO_INACTIVO = ["offline", "inactivo", "desconectado", "disconnected", "inactive"];
const ESTADO_ALERTA = ["alert", "alerta", "alarm"];

// Valores que se envían al backend
const ESTADO_A_CONECTIVIDAD: Record<EstadoSensor, string> = {
  activo: "online",
  alerta: "alert",
  inactivo: "offline",
};

function estadoDesdeApi(connectivityStatus: string): EstadoSensor {
  const valor = normalizar(connectivityStatus);
  if (ESTADO_INACTIVO.includes(valor)) return "inactivo";
  if (ESTADO_ALERTA.includes(valor)) return "alerta";
  return "activo";
}

function textoLectura(lectura: ReadingApi): string {
  return `${lectura.measuredValue} ${lectura.unit ?? ""}`.trim();
}

function ultimaLecturaPorDispositivo(lecturas: ReadingApi[]): Map<string, ReadingApi> {
  const ultimas = new Map<string, ReadingApi>();
  for (const lectura of lecturas) {
    const actual = ultimas.get(lectura.deviceId);
    if (!actual || new Date(lectura.capturedAt) > new Date(actual.capturedAt)) {
      ultimas.set(lectura.deviceId, lectura);
    }
  }
  return ultimas;
}

// El backend no tiene ubicación, nodo ni umbrales
function sensorDesdeApi(device: DeviceApi, ultima?: ReadingApi): Sensor {
  const estado = estadoDesdeApi(device.connectivityStatus);
  return {
    id: device.id,
    codigo: device.serialNumber,
    nombre: device.name,
    tipo: CATEGORIA_A_TIPO[normalizar(device.category)] ?? "otro",
    inmuebleId: "",
    inmuebleNombre: "",
    zonaId: "",
    zonaNombre: "",
    nodoId: "",
    nodoNombre: "",
    ultimaLectura: ultima ? textoLectura(ultima) : null,
    estado,
    conectividad: estado === "inactivo" ? "Sin conexión" : "Conectado",
    ultimaComunicacion: ultima ? tiempoRelativo(ultima.capturedAt) : "Sin comunicación",
    umbralMin: null,
    umbralMax: null,
  };
}

function bodyDesdeInput(input: SensorInput) {
  return {
    serialNumber: input.id,
    name: input.nombre,
    category: input.tipo,
    connectivityStatus: ESTADO_A_CONECTIVIDAD[input.estado],
  };
}

let sensoresMock: Sensor[] = structuredClone(mockSensores);

function sensorDesdeInput(input: SensorInput, id: string, previous?: Sensor): Sensor {
  const inmueble = mockInmuebles.find((i) => i.id === input.inmuebleId);
  const zona = mockZonas.find((z) => z.id === input.zonaId);
  const nodo = mockNodos.find((n) => n.id === input.nodoId);
  return {
    id,
    codigo: input.id,
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

// Sensores de ejemplo con ubicación (los usa Ubicaciones)
export function getSensoresMock(): Sensor[] {
  return structuredClone(sensoresMock);
}

// GET /api/Devices y /api/SensorReadings
export async function getSensores(): Promise<Sensor[]> {
  if (isMock("sensores")) return mockResponse(sensoresMock);
  const [devices, lecturas] = await Promise.all([
    api.get<DeviceApi[]>("/api/Devices"),
    api.get<ReadingApi[]>("/api/SensorReadings").catch(() => [] as ReadingApi[]),
  ]);
  const ultimas = ultimaLecturaPorDispositivo(lecturas);
  return devices.map((device) => sensorDesdeApi(device, ultimas.get(device.id)));
}

// GET /api/Devices/{id}
export async function getSensor(id: string): Promise<Sensor> {
  if (isMock("sensores")) {
    const sensor = sensoresMock.find((s) => s.id === id);
    if (!sensor) throw new Error("Sensor no encontrado");
    return mockResponse(sensor);
  }
  const [device, lecturas] = await Promise.all([
    api.get<DeviceApi>(`/api/Devices/${id}`),
    api.get<ReadingApi[]>("/api/SensorReadings").catch(() => [] as ReadingApi[]),
  ]);
  return sensorDesdeApi(device, ultimaLecturaPorDispositivo(lecturas).get(device.id));
}

// GET /api/SensorReadings (filtra por dispositivo en el cliente)
export async function getLecturasSensor(id: string): Promise<Lectura[]> {
  if (isMock("sensores")) {
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
  const lecturas = await api.get<ReadingApi[]>("/api/SensorReadings");
  return lecturas
    .filter((l) => l.deviceId === id)
    .sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime())
    .slice(0, 6)
    .map((l) => ({ fecha: formatFechaHora(l.capturedAt), valor: textoLectura(l) }));
}

// POST /api/Devices
export async function createSensor(input: SensorInput): Promise<Sensor> {
  if (isMock("sensores")) {
    if (sensoresMock.some((s) => s.codigo === input.id)) {
      throw new Error("Ya existe un sensor con ese identificador");
    }
    const sensor = sensorDesdeInput(input, input.id);
    sensoresMock = [...sensoresMock, sensor];
    return mockResponse(sensor);
  }
  const device = await api.post<DeviceApi>("/api/Devices", bodyDesdeInput(input));
  return sensorDesdeApi(device);
}

// PUT /api/Devices/{id} (responde 204)
export async function updateSensor(id: string, input: SensorInput): Promise<Sensor> {
  if (isMock("sensores")) {
    const previous = sensoresMock.find((s) => s.id === id);
    if (!previous) throw new Error("Sensor no encontrado");
    const sensor = sensorDesdeInput(input, id, previous);
    sensoresMock = sensoresMock.map((s) => (s.id === id ? sensor : s));
    return mockResponse(sensor);
  }
  await api.put<void>(`/api/Devices/${id}`, bodyDesdeInput(input));
  return getSensor(id);
}

// DELETE /api/Devices/{id}
export async function deleteSensor(id: string): Promise<void> {
  if (isMock("sensores")) {
    sensoresMock = sensoresMock.filter((s) => s.id !== id);
    return mockResponse(undefined);
  }
  return api.delete<void>(`/api/Devices/${id}`);
}

// Sin endpoint: solo con datos de ejemplo
export async function probarSensor(_id: string): Promise<void> {
  if (!isMock("sensores")) throw new Error("La prueba de dispositivos aún no está disponible.");
  return mockResponse(undefined, 900);
}
