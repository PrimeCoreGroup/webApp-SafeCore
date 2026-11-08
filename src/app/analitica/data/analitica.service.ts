import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { mockReportes, mockResumen, mockTendencias } from "../presentation/data/mock-analitica";
import {
  SEVERIDADES,
  TIPOS_RIESGO,
  type Desglose,
  type Intervalo,
  type Periodo,
  type PuntoTendencia,
  type Reporte,
  type ResumenAnalitica,
} from "../presentation/models/analitica";

// Usa Analytics; con VITE_USE_MOCKS=true usa datos de ejemplo.

type SummaryApi = {
  totalAlerts: number;
  alertsByType: Record<string, number>;
  alertsBySeverity: Record<string, number>;
  resolvedPercentage: number;
  averageResponseMinutes: number | null;
  deviceAvailabilityPercentage: number;
};

type TrendApi = { date: string; registeredAlerts: number; attendedAlerts: number };
type ReportApi = { id: string; name: string; description: string; format: string };

function rango(dias: Periodo): string {
  const hasta = new Date();
  const desde = new Date(hasta.getTime() - dias * 86400000);
  return `from=${encodeURIComponent(desde.toISOString())}&to=${encodeURIComponent(hasta.toISOString())}`;
}

function desglosar(valores: Record<string, number>, etiquetas: Record<string, string>): Desglose[] {
  return Object.entries(valores)
    .map(([clave, cantidad]) => ({ clave, etiqueta: etiquetas[clave] ?? clave, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

// GET /api/analytics/summary
export async function getResumenAnalitica(dias: Periodo): Promise<ResumenAnalitica> {
  if (isMock("analitica")) return mockResponse(mockResumen);
  const s = await api.get<SummaryApi>(`/api/analytics/summary?${rango(dias)}`);
  return {
    total: s.totalAlerts,
    porTipo: desglosar(s.alertsByType, TIPOS_RIESGO),
    porSeveridad: desglosar(s.alertsBySeverity, SEVERIDADES),
    resueltasPct: s.resolvedPercentage,
    tiempoRespuestaMin: s.averageResponseMinutes,
    disponibilidadPct: s.deviceAvailabilityPercentage,
  };
}

// GET /api/analytics/trends
export async function getTendencias(dias: Periodo, intervalo: Intervalo): Promise<PuntoTendencia[]> {
  if (isMock("analitica")) return mockResponse(mockTendencias(dias));
  const puntos = await api.get<TrendApi[]>(`/api/analytics/trends?interval=${intervalo}&${rango(dias)}`);
  return puntos.map((p) => ({ fecha: p.date, registradas: p.registeredAlerts, atendidas: p.attendedAlerts }));
}

// GET /api/analytics/reports
export async function getReportes(): Promise<Reporte[]> {
  if (isMock("analitica")) return mockResponse(mockReportes);
  const reportes = await api.get<ReportApi[]>("/api/analytics/reports");
  return reportes.map((r) => ({ id: r.id, nombre: r.name, descripcion: r.description, formato: r.format }));
}
