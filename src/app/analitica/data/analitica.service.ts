import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { mockReportes, mockResumen, mockTendencias } from "../presentation/data/mock-analitica";
import type { Reporte, ResumenAnalitica, Tendencias } from "../presentation/models/analitica";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.

// GET /api/v1/analytics/summary
export async function getResumenAnalitica(): Promise<ResumenAnalitica> {
  if (USE_MOCKS) return mockResponse(mockResumen);
  return api.get<ResumenAnalitica>("/api/v1/analytics/summary");
}

// GET /api/v1/analytics/reports
export async function getReportes(): Promise<Reporte[]> {
  if (USE_MOCKS) return mockResponse(mockReportes);
  return api.get<Reporte[]>("/api/v1/analytics/reports");
}

// GET /api/v1/analytics/trends
export async function getTendencias(): Promise<Tendencias> {
  if (USE_MOCKS) return mockResponse(mockTendencias);
  return api.get<Tendencias>("/api/v1/analytics/trends");
}
