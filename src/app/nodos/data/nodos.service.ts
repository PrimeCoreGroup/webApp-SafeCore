import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { formatFechaHora, tiempoRelativo } from "@/lib/format";
import { mockNodos, type NodoMock } from "../presentation/data/mock-nodos";
import { ACTUADOR_UI, SENSOR_UI } from "../presentation/config/nodo-ui";
import type {
  ActuadorNodo,
  ComponentesNodo,
  EstadoNodo,
  Nodo,
  NodoConSecreto,
  NodoInput,
  SensorNodo,
  TipoActuador,
  TipoSensor,
} from "../presentation/models/nodo";

// Usa Devices y SensorReadings; con VITE_USE_MOCKS=true usa datos de ejemplo.
// Un nodo es un Device (el controlador); sus sensores salen de las lecturas que envía.

type DeviceApi = {
  id: string;
  serialNumber: string;
  name: string;
  category: string;
  connectivityStatus: string;
  createdAt: string;
};

type ProvisionedApi = { device: DeviceApi; deviceSecret: string };

type ReadingApi = {
  id: string;
  deviceId: string;
  sensorType: string;
  measuredValue: number | null;
  axisX: number | null;
  axisY: number | null;
  axisZ: number | null;
  digitalAlarm: boolean | null;
  unit: string;
  capturedAt: string;
};

const CATEGORIA = "Nodo";

const ESTADO_DESDE_API: Record<string, EstadoNodo> = {
  Online: "online",
  Offline: "offline",
  Degraded: "degraded",
  Maintenance: "maintenance",
};

const ESTADO_A_API: Record<EstadoNodo, string> = {
  online: "Online",
  offline: "Offline",
  degraded: "Degraded",
  maintenance: "Maintenance",
};

const SENSOR_DESDE_API: Record<string, TipoSensor> = {
  Temperature: "temperatura",
  Gas: "humo",
  Accelerometer: "movimiento",
  Gyroscope: "movimiento",
};

function textoLectura(lectura: ReadingApi): string {
  if (lectura.sensorType === "Temperature") {
    return `${lectura.measuredValue} ${lectura.unit === "C" ? "°C" : lectura.unit}`.trim();
  }
  if (lectura.sensorType === "Gas") {
    return `${lectura.measuredValue}${lectura.digitalAlarm ? " · alarma activa" : ""}`;
  }
  return `X ${lectura.axisX} · Y ${lectura.axisY} · Z ${lectura.axisZ}`;
}

type UltimaLectura = { texto: string; fecha: string };

// Última lectura de cada tipo de sensor, por nodo (el acelerómetro tiene prioridad sobre el giroscopio)
function ultimasPorNodo(lecturas: ReadingApi[]): Map<string, Map<TipoSensor, UltimaLectura>> {
  const resultado = new Map<string, Map<TipoSensor, UltimaLectura>>();
  const ordenadas = lecturas
    .slice()
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
  for (const lectura of ordenadas) {
    const tipo = SENSOR_DESDE_API[lectura.sensorType];
    if (!tipo) continue;
    if (lectura.sensorType === "Gyroscope" && resultado.get(lectura.deviceId)?.has("movimiento")) continue;
    const porTipo = resultado.get(lectura.deviceId) ?? new Map<TipoSensor, UltimaLectura>();
    porTipo.set(tipo, { texto: textoLectura(lectura), fecha: lectura.capturedAt });
    resultado.set(lectura.deviceId, porTipo);
  }
  return resultado;
}

// "Temperatura 1", "Temperatura 2"... si el tipo se repite; "Temperatura" si es único
function nombrar<T extends string>(tipos: T[], etiqueta: (tipo: T) => string): string[] {
  const totales = new Map<T, number>();
  tipos.forEach((tipo) => totales.set(tipo, (totales.get(tipo) ?? 0) + 1));
  const vistos = new Map<T, number>();
  return tipos.map((tipo) => {
    const n = (vistos.get(tipo) ?? 0) + 1;
    vistos.set(tipo, n);
    return totales.get(tipo)! > 1 ? `${etiqueta(tipo)} ${n}` : etiqueta(tipo);
  });
}

function construirSensores(
  nodoId: string,
  tipos: TipoSensor[],
  lecturaDe: (tipo: TipoSensor, indice: number) => string | null,
): SensorNodo[] {
  const nombres = nombrar(tipos, (t) => SENSOR_UI[t].label);
  const porTipo = new Map<TipoSensor, number>();
  return tipos.map((tipo, i) => {
    const indice = porTipo.get(tipo) ?? 0;
    porTipo.set(tipo, indice + 1);
    return { id: `${nodoId}-s${i}`, tipo, nombre: nombres[i]!, ultimaLectura: lecturaDe(tipo, indice) };
  });
}

function construirActuadores(nodoId: string, tipos: TipoActuador[]): ActuadorNodo[] {
  const nombres = nombrar(tipos, (t) => ACTUADOR_UI[t].label);
  return tipos.map((tipo, i) => ({ id: `${nodoId}-a${i}`, tipo, nombre: nombres[i]! }));
}

// ---------------------------------------------------------------------------
// Componentes de cada nodo: el backend aún no los guarda, así que se conservan en memoria
const componentesEnMemoria = new Map<string, ComponentesNodo>();

function nodoDesdeApi(device: DeviceApi, ultimas?: Map<TipoSensor, UltimaLectura>): Nodo {
  const guardados = componentesEnMemoria.get(device.id);
  const tiposSensor = guardados?.sensores ?? [...(ultimas?.keys() ?? [])];
  const fechas = [...(ultimas?.values() ?? [])].map((u) => new Date(u.fecha).getTime());
  const ultima = fechas.length ? new Date(Math.max(...fechas)).toISOString() : null;

  return {
    id: device.id,
    codigo: device.serialNumber,
    nombre: device.name,
    estado: ESTADO_DESDE_API[device.connectivityStatus] ?? "offline",
    creadoEn: formatFechaHora(device.createdAt),
    ultimaComunicacion: ultima ? tiempoRelativo(ultima) : "Sin comunicación",
    inmuebleId: "",
    inmuebleNombre: "",
    zonaId: "",
    zonaNombre: "",
    sensores: construirSensores(device.id, tiposSensor, (tipo, indice) =>
      indice === 0 ? (ultimas?.get(tipo)?.texto ?? null) : null,
    ),
    actuadores: construirActuadores(device.id, guardados?.actuadores ?? []),
    registradoPor: null,
  };
}

function bodyDesdeInput(input: NodoInput) {
  return {
    serialNumber: input.codigo,
    name: input.nombre,
    category: CATEGORIA,
    connectivityStatus: ESTADO_A_API[input.estado],
  };
}

// ---------------------------------------------------------------------------
let nodosMock: Nodo[] = mockNodos.map(nodoDesdeMock);

function nodoDesdeMock(mock: NodoMock): Nodo {
  const lecturas = new Map<TipoSensor, string | null>();
  mock.sensores.forEach((s) => lecturas.set(s.tipo, s.ultimaLectura));
  return {
    ...mock,
    sensores: construirSensores(
      mock.id,
      mock.sensores.map((s) => s.tipo),
      (tipo, indice) => (indice === 0 ? (lecturas.get(tipo) ?? null) : null),
    ),
    actuadores: construirActuadores(mock.id, mock.actuadores),
  };
}

// Nodos de ejemplo con ubicación (los usa Ubicaciones)
export function getNodosMock(): Nodo[] {
  return structuredClone(nodosMock);
}

function secretoDeEjemplo(): string {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 44);
}

function nodoDesdeInput(input: NodoInput, id: string, previo?: Nodo): Nodo {
  return {
    id,
    codigo: input.codigo,
    nombre: input.nombre,
    estado: input.estado,
    creadoEn: previo?.creadoEn ?? "Ahora",
    ultimaComunicacion: previo?.ultimaComunicacion ?? "Sin comunicación",
    inmuebleId: previo?.inmuebleId ?? "",
    inmuebleNombre: previo?.inmuebleNombre ?? "",
    zonaId: previo?.zonaId ?? "",
    zonaNombre: previo?.zonaNombre ?? "",
    sensores: construirSensores(id, input.sensores, (tipo, indice) =>
      indice === 0 ? (previo?.sensores.find((s) => s.tipo === tipo)?.ultimaLectura ?? null) : null,
    ),
    actuadores: construirActuadores(id, input.actuadores),
    registradoPor: previo?.registradoPor ?? "Tú",
  };
}

// ---------------------------------------------------------------------------

async function leerLecturas(): Promise<ReadingApi[]> {
  return api.get<ReadingApi[]>("/api/SensorReadings?page=1&pageSize=250").catch(() => []);
}

// GET /api/devices y /api/SensorReadings
export async function getNodos(): Promise<Nodo[]> {
  if (isMock("nodos")) return mockResponse(nodosMock);
  const [devices, lecturas] = await Promise.all([
    api.get<DeviceApi[]>("/api/devices?page=1&pageSize=250"),
    leerLecturas(),
  ]);
  const ultimas = ultimasPorNodo(lecturas);
  return devices.map((device) => nodoDesdeApi(device, ultimas.get(device.id)));
}

// GET /api/devices/{id}
export async function getNodo(id: string): Promise<Nodo> {
  if (isMock("nodos")) {
    const nodo = nodosMock.find((n) => n.id === id);
    if (!nodo) throw new Error("Nodo no encontrado");
    return mockResponse(nodo);
  }
  const [device, lecturas] = await Promise.all([api.get<DeviceApi>(`/api/devices/${id}`), leerLecturas()]);
  return nodoDesdeApi(device, ultimasPorNodo(lecturas).get(device.id));
}

// POST /api/devices (devuelve el secreto una sola vez)
export async function createNodo(input: NodoInput): Promise<NodoConSecreto> {
  if (isMock("nodos")) {
    if (nodosMock.some((n) => n.codigo === input.codigo)) {
      throw new Error("Ya existe un nodo con ese número de serie.");
    }
    const nodo = nodoDesdeInput(input, `nodo-${crypto.randomUUID().slice(0, 8)}`);
    nodosMock = [...nodosMock, nodo];
    return mockResponse({ nodo, secreto: secretoDeEjemplo() });
  }
  const { device, deviceSecret } = await api.post<ProvisionedApi>("/api/devices", {
    ...bodyDesdeInput(input),
    connectivityStatus: ESTADO_A_API.offline,
  });
  componentesEnMemoria.set(device.id, { sensores: input.sensores, actuadores: input.actuadores });
  return { nodo: nodoDesdeApi(device), secreto: deviceSecret };
}

// PUT /api/devices/{id} (responde 204)
export async function updateNodo(id: string, input: NodoInput): Promise<Nodo> {
  if (isMock("nodos")) {
    const previo = nodosMock.find((n) => n.id === id);
    if (!previo) throw new Error("Nodo no encontrado");
    const nodo = nodoDesdeInput(input, id, previo);
    nodosMock = nodosMock.map((n) => (n.id === id ? nodo : n));
    return mockResponse(nodo);
  }
  await api.put<void>(`/api/devices/${id}`, bodyDesdeInput(input));
  componentesEnMemoria.set(id, { sensores: input.sensores, actuadores: input.actuadores });
  return getNodo(id);
}

// DELETE /api/devices/{id}
export async function deleteNodo(id: string): Promise<void> {
  if (isMock("nodos")) {
    nodosMock = nodosMock.filter((n) => n.id !== id);
    return mockResponse(undefined);
  }
  await api.delete<void>(`/api/devices/${id}`);
  componentesEnMemoria.delete(id);
}

// POST /api/devices/{id}/rotate-secret
export async function rotarSecreto(id: string): Promise<NodoConSecreto> {
  if (isMock("nodos")) {
    const nodo = nodosMock.find((n) => n.id === id);
    if (!nodo) throw new Error("Nodo no encontrado");
    return mockResponse({ nodo, secreto: secretoDeEjemplo() });
  }
  const { device, deviceSecret } = await api.post<ProvisionedApi>(`/api/devices/${id}/rotate-secret`, {});
  return { nodo: nodoDesdeApi(device), secreto: deviceSecret };
}
