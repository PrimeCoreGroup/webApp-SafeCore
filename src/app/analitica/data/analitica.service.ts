import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { mockReportes, mockResumen, mockTendencias } from "../presentation/data/mock-analitica";
import type { Reporte, ResumenAnalitica, Tendencias } from "../presentation/models/analitica";

// Datos de ejemplo (el backend no tiene analítica). Los endpoints son supuestos.

// GET /api/v1/analytics/summary
export async function getResumenAnalitica(): Promise<ResumenAnalitica> {
  if (isMock("analitica")) return mockResponse(mockResumen);
  return api.get<ResumenAnalitica>("/api/v1/analytics/summary");
}

// GET /api/v1/analytics/reports
export async function getReportes(): Promise<Reporte[]> {
  if (isMock("analitica")) return mockResponse(mockReportes);
  return api.get<Reporte[]>("/api/v1/analytics/reports");
}

// GET /api/v1/analytics/trends
export async function getTendencias(): Promise<Tendencias> {
  if (isMock("analitica")) return mockResponse(mockTendencias);
  return api.get<Tendencias>("/api/v1/analytics/trends");
}
