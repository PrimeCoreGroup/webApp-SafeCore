import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { formatFechaHora, normalizar, tiempoRelativo } from "@/lib/format";
import { mockInmuebles, mockZonas } from "@/app/ubicaciones/presentation/data/mock-ubicaciones";
import { ACTUADOR_UI, SENSOR_UI } from "../presentation/config/nodo-ui";
import { mockNodos, type NodoMock } from "../presentation/data/mock-nodos";
import type {
  ClaseComponente,
  ComponenteInput,
  ComponenteNodo,
  EstadoComponente,
  EstadoNodo,
  KitNodo,
  Nodo,
  NodoConSecreto,
  NodoInput,
  ResultadoPrueba,
  TipoActuador,
  TipoSensor,
} from "../presentation/models/nodo";

// Usa Devices, sus componentes y SensorReadings; con VITE_USE_MOCKS=true usa datos de ejemplo.
// Un nodo es un Device (el controlador); sus sensores y actuadores son componentes del dispositivo.

type DeviceApi = {
  id: string;
  serialNumber: string;
  name: string;
  category: string;
  connectivityStatus: string;
  createdAt: string;
  zoneId: string | null;
  zoneName: string | null;
  propertyId: string | null;
  propertyName: string | null;
  createdByName: string | null;
  lastSeenAt: string | null;
};

type ProvisionedApi = { device: DeviceApi; deviceSecret: string };

type ComponentApi = {
  id: string;
  deviceId: string;
  kind: "Sensor" | "Actuator";
  type: string;
  label: string;
  channel: string | null;
  status: string;
  lastSeenAt: string | null;
  installedAt: string | null;
};

type ReadingApi = {
  id: string;
  deviceId: string;
  componentId: string | null;
  sensorType: string;
  measuredValue: number | null;
  axisX: number | null;
  axisY: number | null;
  axisZ: number | null;
  digitalAlarm: boolean | null;
  unit: string;
  capturedAt: string;
};

type TestApi = { commandId: string };
type CommandApi = { status: string; result: string | null };

const CATEGORIA = "Nodo";

const ESTADO_NODO_DESDE_API: Record<string, EstadoNodo> = {
  Online: "online",
  Offline: "offline",
  Degraded: "degraded",
  Maintenance: "maintenance",
};

const ESTADO_NODO_A_API: Record<EstadoNodo, string> = {
  online: "Online",
  offline: "Offline",
  degraded: "Degraded",
  maintenance: "Maintenance",
};

const ESTADO_COMPONENTE_DESDE_API: Record<string, EstadoComponente> = {
  Ok: "ok",
  Fault: "fault",
  Disconnected: "disconnected",
  Maintenance: "maintenance",
  Disabled: "disabled",
};

const ESTADO_COMPONENTE_A_API: Record<EstadoComponente, string> = {
  ok: "Ok",
  fault: "Fault",
  disconnected: "Disconnected",
  maintenance: "Maintenance",
  disabled: "Disabled",
};

// Tipo que se guarda en el backend al registrar un componente desde la web
const TIPO_A_API: Record<string, string> = {
  temperatura: "Temperature",
  humo: "Gas",
  movimiento: "MPU6050",
  luces: "Led",
  sonido: "Buzzer",
  servomotor: "Servo",
  otro: "Other",
};

// El backend guarda el tipo como texto libre; se reconocen los nombres más comunes
function tipoDesdeApi(clase: ClaseComponente, tipo: string): ComponenteNodo["tipo"] {
  const t = normalizar(tipo);
  if (clase === "sensor") {
    if (/temp|ds18/.test(t)) return "temperatura";
    if (/gas|mq|smoke|humo/.test(t)) return "humo";
    if (/accel|motion|movement|mpu|gyro|mov/.test(t)) return "movimiento";
    return "otro";
  }
  if (/led|luz|light/.test(t)) return "luces";
  if (/buzz|sound|sonido|alarm|siren/.test(t)) return "sonido";
  if (/servo|door|puerta/.test(t)) return "servomotor";
  return "otro";
}

function textoLectura(l: ReadingApi): string {
  if (l.sensorType === "Temperature") return `${l.measuredValue} ${l.unit === "C" ? "°C" : l.unit}`.trim();
  if (l.sensorType === "Gas") return `${l.measuredValue}${l.digitalAlarm ? " · alarma activa" : ""}`;
  return `X ${l.axisX} · Y ${l.axisY} · Z ${l.axisZ}`;
}

type Ultima = { texto: string; fecha: string };

const TIPO_SENSOR_DE_LECTURA: Record<string, TipoSensor> = {
  Temperature: "temperatura",
  Gas: "humo",
  Accelerometer: "movimiento",
  Gyroscope: "movimiento",
};

// Última lectura por componente y, como respaldo, por nodo y tipo (lecturas sin componente)
function indexarLecturas(lecturas: ReadingApi[]) {
  const porComponente = new Map<string, Ultima>();
  const porNodoYTipo = new Map<string, Map<TipoSensor, Ultima>>();
  const ordenadas = lecturas
    .slice()
    .sort((a, b) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
  for (const l of ordenadas) {
    const ultima = { texto: textoLectura(l), fecha: l.capturedAt };
    if (l.componentId) porComponente.set(l.componentId, ultima);
    const tipo = TIPO_SENSOR_DE_LECTURA[l.sensorType];
    if (!tipo) continue;
    if (l.sensorType === "Gyroscope" && porNodoYTipo.get(l.deviceId)?.has("movimiento")) continue;
    const porTipo = porNodoYTipo.get(l.deviceId) ?? new Map<TipoSensor, Ultima>();
    porTipo.set(tipo, ultima);
    porNodoYTipo.set(l.deviceId, porTipo);
  }
  return { porComponente, porNodoYTipo };
}

type IndiceLecturas = ReturnType<typeof indexarLecturas>;

function nodoDesdeApi(device: DeviceApi, componentes: ComponentApi[], indice: IndiceLecturas): Nodo {
  const sensoresApi = componentes.filter((c) => c.kind === "Sensor");
  const convertir = (c: ComponentApi): ComponenteNodo => {
    const clase: ClaseComponente = c.kind === "Sensor" ? "sensor" : "actuador";
    const tipo = tipoDesdeApi(clase, c.type);
    let lectura: Ultima | undefined;
    if (clase === "sensor") {
      const mismosTipos = sensoresApi.filter((s) => tipoDesdeApi("sensor", s.type) === tipo).length;
      lectura =
        indice.porComponente.get(c.id) ??
        (mismosTipos === 1 ? indice.porNodoYTipo.get(device.id)?.get(tipo as TipoSensor) : undefined);
    }
    return {
      id: c.id,
      clase,
      tipo,
      nombre: c.label,
      canal: c.channel,
      estado: ESTADO_COMPONENTE_DESDE_API[c.status] ?? "disconnected",
      ultimaSenal: c.lastSeenAt ? tiempoRelativo(c.lastSeenAt) : null,
      ultimaLectura: lectura?.texto ?? null,
      instaladoEn: c.installedAt ? formatFechaHora(c.installedAt) : null,
    };
  };

  return {
    id: device.id,
    codigo: device.serialNumber,
    nombre: device.name,
    estado: ESTADO_NODO_DESDE_API[device.connectivityStatus] ?? "offline",
    creadoEn: formatFechaHora(device.createdAt),
    ultimaComunicacion: device.lastSeenAt ? tiempoRelativo(device.lastSeenAt) : "Sin comunicación",
    inmuebleId: device.propertyId ?? "",
    inmuebleNombre: device.propertyName ?? "",
    zonaId: device.zoneId ?? "",
    zonaNombre: device.zoneName ?? "",
    sensores: componentes.filter((c) => c.kind === "Sensor").map(convertir),
    actuadores: componentes.filter((c) => c.kind === "Actuator").map(convertir),
    registradoPor: device.createdByName,
  };
}

function bodyNodo(input: NodoInput) {
  return {
    serialNumber: input.codigo,
    name: input.nombre,
    category: CATEGORIA,
    connectivityStatus: ESTADO_NODO_A_API[input.estado],
  };
}

function bodyComponente(input: ComponenteInput) {
  return {
    kind: input.clase === "sensor" ? "Sensor" : "Actuator",
    type: TIPO_A_API[input.tipo] ?? "Other",
    label: input.nombre,
    channel: input.canal || null,
    status: ESTADO_COMPONENTE_A_API[input.estado],
  };
}

// "Temperatura 1", "Temperatura 2"... si el tipo se repite; "Temperatura" si es único
function etiquetasDelKit(kit: KitNodo): { clase: ClaseComponente; tipo: ComponenteNodo["tipo"]; nombre: string }[] {
  const nombrar = <T extends string>(tipos: T[], etiqueta: (t: T) => string) => {
    const totales = new Map<T, number>();
    tipos.forEach((t) => totales.set(t, (totales.get(t) ?? 0) + 1));
    const vistos = new Map<T, number>();
    return tipos.map((tipo) => {
      const n = (vistos.get(tipo) ?? 0) + 1;
      vistos.set(tipo, n);
      return { tipo, nombre: totales.get(tipo)! > 1 ? `${etiqueta(tipo)} ${n}` : etiqueta(tipo) };
    });
  };
  return [
    ...nombrar(kit.sensores, (t) => SENSOR_UI[t].label).map((c) => ({ clase: "sensor" as const, ...c })),
    ...nombrar(kit.actuadores, (t) => ACTUADOR_UI[t].label).map((c) => ({ clase: "actuador" as const, ...c })),
  ];
}

async function leerLecturas(): Promise<ReadingApi[]> {
  return api.get<ReadingApi[]>("/api/SensorReadings?page=1&pageSize=250").catch(() => []);
}

async function leerComponentes(deviceId: string): Promise<ComponentApi[]> {
  return api.get<ComponentApi[]>(`/api/devices/${deviceId}/components`).catch(() => []);
}

// ---------------------------------------------------------------------------
let nodosMock: Nodo[] = mockNodos.map(nodoDesdeMock);
let siguienteComponente = 1;

function nodoDesdeMock(mock: NodoMock): Nodo {
  return {
    ...mock,
    sensores: mock.sensores.map((s, i) => ({
      id: `${mock.id}-s${i}`,
      clase: "sensor" as const,
      tipo: s.tipo,
      nombre: s.nombre,
      canal: null,
      estado: s.estado,
      ultimaSenal: s.ultimaLectura ? mock.ultimaComunicacion : null,
      ultimaLectura: s.ultimaLectura,
      instaladoEn: null,
    })),
    actuadores: mock.actuadores.map((a, i) => ({
      id: `${mock.id}-a${i}`,
      clase: "actuador" as const,
      tipo: a.tipo,
      nombre: a.nombre,
      canal: null,
      estado: a.estado,
      ultimaSenal: mock.ultimaComunicacion,
      ultimaLectura: null,
      instaladoEn: null,
    })),
  };
}

// Nodos de ejemplo con ubicación (los usa Ubicaciones)
export function getNodosMock(): Nodo[] {
  return structuredClone(nodosMock);
}

function ubicacionMock(zonaId: string | null) {
  const zona = mockZonas.find((z) => z.id === zonaId);
  const inmueble = mockInmuebles.find((i) => i.id === zona?.inmuebleId);
  return {
    inmuebleId: inmueble?.id ?? "",
    inmuebleNombre: inmueble?.nombre ?? "",
    zonaId: zona?.id ?? "",
    zonaNombre: zona?.nombre ?? "",
  };
}

function secretoDeEjemplo(): string {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 44);
}

function actualizarNodoMock(id: string, cambios: (n: Nodo) => Nodo): Nodo {
  const actual = nodosMock.find((n) => n.id === id);
  if (!actual) throw new Error("Nodo no encontrado");
  const nuevo = cambios(actual);
  nodosMock = nodosMock.map((n) => (n.id === id ? nuevo : n));
  return nuevo;
}

// ---------------------------------------------------------------------------

// GET /api/devices, /api/devices/{id}/components y /api/SensorReadings
export async function getNodos(): Promise<Nodo[]> {
  if (isMock("nodos")) return mockResponse(nodosMock);
  const [devices, lecturas] = await Promise.all([
    api.get<DeviceApi[]>("/api/devices?page=1&pageSize=250"),
    leerLecturas(),
  ]);
  const indice = indexarLecturas(lecturas);
  return Promise.all(devices.map(async (d) => nodoDesdeApi(d, await leerComponentes(d.id), indice)));
}

// GET /api/devices/{id}
export async function getNodo(id: string): Promise<Nodo> {
  if (isMock("nodos")) {
    const nodo = nodosMock.find((n) => n.id === id);
    if (!nodo) throw new Error("Nodo no encontrado");
    return mockResponse(nodo);
  }
  const [device, componentes, lecturas] = await Promise.all([
    api.get<DeviceApi>(`/api/devices/${id}`),
    leerComponentes(id),
    leerLecturas(),
  ]);
  return nodoDesdeApi(device, componentes, indexarLecturas(lecturas));
}

// POST /api/devices (devuelve el secreto una sola vez), luego zona y componentes del kit
export async function createNodo(input: NodoInput): Promise<NodoConSecreto> {
  if (isMock("nodos")) {
    if (nodosMock.some((n) => n.codigo === input.codigo)) {
      throw new Error("Ya existe un nodo con ese número de serie.");
    }
    const id = `nodo-${crypto.randomUUID().slice(0, 8)}`;
    const componentes = etiquetasDelKit(input.kit);
    const nodo: Nodo = {
      id,
      codigo: input.codigo,
      nombre: input.nombre,
      estado: "offline",
      creadoEn: "Ahora",
      ultimaComunicacion: "Sin comunicación",
      ...ubicacionMock(input.zonaId),
      sensores: componentes
        .filter((c) => c.clase === "sensor")
        .map((c) => ({ id: `${id}-c${siguienteComponente++}`, ...c, canal: null, estado: "disconnected" as const, ultimaSenal: null, ultimaLectura: null, instaladoEn: null })),
      actuadores: componentes
        .filter((c) => c.clase === "actuador")
        .map((c) => ({ id: `${id}-c${siguienteComponente++}`, ...c, canal: null, estado: "disconnected" as const, ultimaSenal: null, ultimaLectura: null, instaladoEn: null })),
      registradoPor: "Tú",
    };
    nodosMock = [...nodosMock, nodo];
    return mockResponse({ nodo, secreto: secretoDeEjemplo(), aviso: null });
  }

  const { device, deviceSecret } = await api.post<ProvisionedApi>("/api/devices", {
    ...bodyNodo(input),
    connectivityStatus: ESTADO_NODO_A_API.offline,
  });

  // El nodo ya existe: si falla un paso posterior se informa, pero el secreto no se pierde
  const fallos: string[] = [];
  if (input.zonaId) {
    try {
      await api.put<void>(`/api/devices/${device.id}/zone`, { zoneId: input.zonaId });
    } catch {
      fallos.push("la zona");
    }
  }
  for (const c of etiquetasDelKit(input.kit)) {
    try {
      await api.post(`/api/devices/${device.id}/components`, {
        ...bodyComponente({ clase: c.clase, tipo: c.tipo, nombre: c.nombre, canal: null, estado: "disconnected" }),
      });
    } catch {
      fallos.push(c.nombre);
    }
  }
  const aviso = fallos.length ? `No se pudo registrar: ${fallos.join(", ")}. Puedes agregarlos desde el detalle del nodo.` : null;
  return { nodo: await getNodo(device.id), secreto: deviceSecret, aviso };
}

// PUT /api/devices/{id} y PUT /api/devices/{id}/zone
export async function updateNodo(id: string, input: NodoInput): Promise<Nodo> {
  if (isMock("nodos")) {
    return mockResponse(
      actualizarNodoMock(id, (n) => ({
        ...n,
        codigo: input.codigo,
        nombre: input.nombre,
        estado: input.estado,
        ...ubicacionMock(input.zonaId),
      })),
    );
  }
  await api.put<void>(`/api/devices/${id}`, bodyNodo(input));
  await api.put<void>(`/api/devices/${id}/zone`, { zoneId: input.zonaId });
  return getNodo(id);
}

// DELETE /api/devices/{id}
export async function deleteNodo(id: string): Promise<void> {
  if (isMock("nodos")) {
    nodosMock = nodosMock.filter((n) => n.id !== id);
    return mockResponse(undefined);
  }
  await api.delete<void>(`/api/devices/${id}`);
}

// POST /api/devices/{id}/rotate-secret
export async function rotarSecreto(id: string): Promise<NodoConSecreto> {
  if (isMock("nodos")) {
    const nodo = nodosMock.find((n) => n.id === id);
    if (!nodo) throw new Error("Nodo no encontrado");
    return mockResponse({ nodo, secreto: secretoDeEjemplo(), aviso: null });
  }
  const { deviceSecret } = await api.post<ProvisionedApi>(`/api/devices/${id}/rotate-secret`, {});
  return { nodo: await getNodo(id), secreto: deviceSecret, aviso: null };
}

// POST /api/devices/{id}/components
export async function createComponente(nodoId: string, input: ComponenteInput): Promise<void> {
  if (isMock("nodos")) {
    actualizarNodoMock(nodoId, (n) => {
      const nuevo: ComponenteNodo = {
        id: `${nodoId}-c${siguienteComponente++}`,
        clase: input.clase,
        tipo: input.tipo,
        nombre: input.nombre,
        canal: input.canal,
        estado: input.estado,
        ultimaSenal: null,
        ultimaLectura: null,
        instaladoEn: null,
      };
      return input.clase === "sensor"
        ? { ...n, sensores: [...n.sensores, nuevo] }
        : { ...n, actuadores: [...n.actuadores, nuevo] };
    });
    return mockResponse(undefined);
  }
  await api.post(`/api/devices/${nodoId}/components`, bodyComponente(input));
}

// PUT /api/devices/{id}/components/{componentId}
export async function updateComponente(nodoId: string, componenteId: string, input: ComponenteInput): Promise<void> {
  if (isMock("nodos")) {
    actualizarNodoMock(nodoId, (n) => {
      const cambiar = (lista: ComponenteNodo[]) =>
        lista.map((c) =>
          c.id === componenteId ? { ...c, tipo: input.tipo, nombre: input.nombre, canal: input.canal, estado: input.estado } : c,
        );
      return { ...n, sensores: cambiar(n.sensores), actuadores: cambiar(n.actuadores) };
    });
    return mockResponse(undefined);
  }
  await api.put(`/api/devices/${nodoId}/components/${componenteId}`, bodyComponente(input));
}

// DELETE /api/devices/{id}/components/{componentId}
export async function deleteComponente(nodoId: string, componenteId: string): Promise<void> {
  if (isMock("nodos")) {
    actualizarNodoMock(nodoId, (n) => ({
      ...n,
      sensores: n.sensores.filter((c) => c.id !== componenteId),
      actuadores: n.actuadores.filter((c) => c.id !== componenteId),
    }));
    return mockResponse(undefined);
  }
  await api.delete<void>(`/api/devices/${nodoId}/components/${componenteId}`);
}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /api/devices/{id}/components/{componentId}/test y GET /api/devices/{id}/commands/{commandId}
// El nodo ejecuta la prueba y reporta el resultado; se consulta hasta 60 segundos.
export async function probarComponente(nodoId: string, componenteId: string): Promise<ResultadoPrueba> {
  if (isMock("nodos")) {
    await mockResponse(undefined, 900);
    return { estado: "completed", detalle: "Prueba completada." };
  }
  const { commandId } = await api.post<TestApi>(`/api/devices/${nodoId}/components/${componenteId}/test`, {});
  const limite = Date.now() + 60_000;
  while (Date.now() < limite) {
    await esperar(2000);
    const comando = await api.get<CommandApi>(`/api/devices/${nodoId}/commands/${commandId}`);
    if (comando.status !== "Pending") {
      return { estado: comando.status === "Completed" ? "completed" : "failed", detalle: comando.result };
    }
  }
  return { estado: "pending", detalle: null };
}
