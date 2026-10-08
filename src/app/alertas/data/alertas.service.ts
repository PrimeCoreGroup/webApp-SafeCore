import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { formatFechaHora, normalizar } from "@/lib/format";
import { mockAlertas } from "../presentation/data/mock-alertas";
import type { Alerta, EstadoAlerta, SeveridadAlerta } from "../presentation/models/alerta";

// Usa RiskSituations; con VITE_USE_MOCKS=true usa datos de ejemplo.

type RiskSituationApi = {
  id: string;
  riskType: string;
  status: string;
  severity: string;
  detectedAt: string;
};

// Traduce valores libres del backend (español o inglés)
const TIPO_RIESGO: Record<string, string> = {
  fire: "Incendio", incendio: "Incendio",
  earthquake: "Sismo", seismic: "Sismo", sismo: "Sismo",
  gas: "Fuga de gas", gas_leak: "Fuga de gas",
  smoke: "Detección de humo", humo: "Detección de humo",
  temperature: "Temperatura elevada", temperatura: "Temperatura elevada",
};

const SEVERIDAD: Record<string, SeveridadAlerta> = {
  critical: "critica", critica: "critica", high: "critica", alta: "critica",
  warning: "advertencia", advertencia: "advertencia", medium: "advertencia", media: "advertencia",
  info: "informacion", informacion: "informacion", low: "informacion", baja: "informacion",
};

const ESTADO: Record<string, EstadoAlerta> = {
  active: "activa", activa: "activa", open: "activa", detected: "activa",
  resolved: "resuelta", resuelta: "resuelta", closed: "resuelta",
  archived: "archivada", archivada: "archivada",
};

// Estado que se envía al resolver
const STATUS_RESUELTA = "resolved";

function capitalizar(texto: string): string {
  return texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "Situación de riesgo";
}

// El backend no tiene ubicación, dispositivo ni descripción
function alertaDesdeApi(riesgo: RiskSituationApi): Alerta {
  const evento = TIPO_RIESGO[normalizar(riesgo.riskType)] ?? capitalizar(riesgo.riskType);
  return {
    id: riesgo.id,
    evento,
    severidad: SEVERIDAD[normalizar(riesgo.severity)] ?? "advertencia",
    ubicacion: "Sin ubicación",
    estado: ESTADO[normalizar(riesgo.status)] ?? "activa",
    fecha: formatFechaHora(riesgo.detectedAt),
    dispositivo: "Sin dispositivo asociado",
    dispositivoId: null,
    descripcion: `Situación de riesgo de tipo "${riesgo.riskType}" con severidad "${riesgo.severity}", detectada por el sistema.`,
  };
}

let alertasMock: Alerta[] = structuredClone(mockAlertas);

// GET /api/RiskSituations
export async function getAlertas(): Promise<Alerta[]> {
  if (isMock("alertas")) return mockResponse(alertasMock, 0);
  const riesgos = await api.get<RiskSituationApi[]>("/api/RiskSituations");
  return riesgos
    .slice()
    .sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    .map(alertaDesdeApi);
}

// GET /api/RiskSituations/{id}
export async function getAlerta(id: string): Promise<Alerta> {
  if (isMock("alertas")) {
    const alerta = alertasMock.find((a) => a.id === id);
    if (!alerta) throw new Error("Alerta no encontrada");
    return mockResponse(alerta);
  }
  return alertaDesdeApi(await api.get<RiskSituationApi>(`/api/RiskSituations/${id}`));
}

// PUT /api/RiskSituations/{id} (reenvía los campos actuales)
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
