import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { formatFechaHora } from "@/lib/format";
import { mockAlertas } from "../presentation/data/mock-alertas";
import type { Alerta, EstadoAlerta, SeveridadAlerta } from "../presentation/models/alerta";

// Usa RiskSituations; con VITE_USE_MOCKS=true usa datos de ejemplo.

type RiskSituationApi = {
  id: string;
  deviceId: string | null;
  componentId: string | null;
  origin: string;
  riskType: string;
  status: string;
  severity: string;
  detectedAt: string;
};

type DeviceApi = { id: string; name: string; zoneName: string | null; propertyName: string | null };
type ComponentApi = { id: string; label: string };

const EVENTO: Record<string, { titulo: string; descripcion: string }> = {
  Fire: {
    titulo: "Incendio",
    descripcion: "La temperatura superó el umbral de seguridad. Verifica la zona y aplica el protocolo de emergencia.",
  },
  GasOrSmoke: {
    titulo: "Humo o gas",
    descripcion: "Se detectó gas o humo en el ambiente. Verifica la ventilación y la zona afectada.",
  },
  Earthquake: {
    titulo: "Sismo o impacto",
    descripcion: "Se detectó un movimiento brusco. Verifica el estado de la edificación y de las personas.",
  },
  SensorFault: {
    titulo: "Falla de sensor",
    descripcion: "Un sensor del nodo reportó una falla o está desconectado. Revisa el nodo.",
  },
};

const SEVERIDAD: Record<string, SeveridadAlerta> = {
  Critical: "critica",
  High: "critica",
  Medium: "advertencia",
  Low: "informacion",
};

const ESTADO: Record<string, EstadoAlerta> = {
  Open: "activa",
  Acknowledged: "activa",
  Resolved: "resuelta",
};

// Estado que se envía al resolver
const STATUS_RESUELTA = "Resolved";

type Contexto = { nodos: Map<string, { nombre: string; ubicacion: string }>; componentes: Map<string, string> };

function alertaDesdeApi(riesgo: RiskSituationApi, contexto: Contexto): Alerta {
  const evento = EVENTO[riesgo.riskType];
  const origen = riesgo.origin === "Sensor" ? "Detectada automáticamente por un sensor." : "Registrada manualmente.";
  const nodo = riesgo.deviceId ? contexto.nodos.get(riesgo.deviceId) : undefined;
  return {
    id: riesgo.id,
    evento: evento?.titulo ?? riesgo.riskType,
    severidad: SEVERIDAD[riesgo.severity] ?? "advertencia",
    ubicacion: nodo?.ubicacion ?? "Sin ubicación",
    estado: ESTADO[riesgo.status] ?? "activa",
    fecha: formatFechaHora(riesgo.detectedAt),
    dispositivo: riesgo.deviceId ? (nodo?.nombre ?? "Nodo") : "Sin nodo asociado",
    dispositivoId: riesgo.deviceId,
    componente: riesgo.componentId ? (contexto.componentes.get(riesgo.componentId) ?? null) : null,
    descripcion: `${evento?.descripcion ?? "Situación de riesgo detectada."} ${origen}`,
  };
}

async function cargarContexto(riesgos: RiskSituationApi[]): Promise<Contexto> {
  const dispositivos = await api
    .get<DeviceApi[]>("/api/devices?page=1&pageSize=250")
    .catch(() => [] as DeviceApi[]);
  const nodos = new Map(
    dispositivos.map((d) => [
      d.id,
      {
        nombre: d.name,
        ubicacion: d.propertyName ? `${d.propertyName}${d.zoneName ? ` · ${d.zoneName}` : ""}` : "Sin ubicación",
      },
    ]),
  );

  // Solo se consultan los componentes de los nodos que tienen alertas con componente
  const nodosConComponente = [...new Set(riesgos.filter((r) => r.componentId && r.deviceId).map((r) => r.deviceId!))];
  const listas = await Promise.all(
    nodosConComponente.map((id) =>
      api.get<ComponentApi[]>(`/api/devices/${id}/components`).catch(() => [] as ComponentApi[]),
    ),
  );
  const componentes = new Map(listas.flat().map((c) => [c.id, c.label]));
  return { nodos, componentes };
}

let alertasMock: Alerta[] = structuredClone(mockAlertas);

// GET /api/RiskSituations
export async function getAlertas(): Promise<Alerta[]> {
  if (isMock("alertas")) return mockResponse(alertasMock, 0);
  const riesgos = await api.get<RiskSituationApi[]>("/api/RiskSituations?page=1&pageSize=250");
  const contexto = await cargarContexto(riesgos);
  return riesgos
    .slice()
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .map((riesgo) => alertaDesdeApi(riesgo, contexto));
}

// GET /api/RiskSituations/{id}
export async function getAlerta(id: string): Promise<Alerta> {
  if (isMock("alertas")) {
    const alerta = alertasMock.find((a) => a.id === id);
    if (!alerta) throw new Error("Alerta no encontrada");
    return mockResponse(alerta);
  }
  const riesgo = await api.get<RiskSituationApi>(`/api/RiskSituations/${id}`);
  return alertaDesdeApi(riesgo, await cargarContexto([riesgo]));
}

// PUT /api/RiskSituations/{id} (reenvía los campos actuales; responde 204)
export async function resolverAlerta(id: string): Promise<Alerta> {
  if (isMock("alertas")) {
    const alerta = alertasMock.find((a) => a.id === id);
    if (!alerta) throw new Error("Alerta no encontrada");
    alerta.estado = "resuelta";
    return mockResponse(alerta);
  }
  const actual = await api.get<RiskSituationApi>(`/api/RiskSituations/${id}`);
  const { riskType, severity, detectedAt } = actual;
  await api.put<void>(`/api/RiskSituations/${id}`, { riskType, severity, detectedAt, status: STATUS_RESUELTA });
  return getAlerta(id);
}
