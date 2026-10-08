import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { mockAlertas } from "../presentation/data/mock-alertas";
import type { Alerta } from "../presentation/models/alerta";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.
// En modo mock los cambios se guardan solo en memoria (se pierden al recargar).
let alertasMock: Alerta[] = structuredClone(mockAlertas);

// GET /api/v1/alerts
export async function getAlertas(): Promise<Alerta[]> {
  if (USE_MOCKS) return mockResponse(alertasMock, 0);
  return api.get<Alerta[]>("/api/v1/alerts");
}

// GET /api/v1/alerts/{id}
export async function getAlerta(id: string): Promise<Alerta> {
  if (USE_MOCKS) {
    const alerta = alertasMock.find((a) => a.id === id);
    if (!alerta) throw new Error("Alerta no encontrada");
    return mockResponse(alerta);
  }
  return api.get<Alerta>(`/api/v1/alerts/${id}`);
}

// POST /api/v1/alerts/{id}/resolve
export async function resolverAlerta(id: string): Promise<Alerta> {
  if (USE_MOCKS) {
    const alerta = alertasMock.find((a) => a.id === id);
    if (!alerta) throw new Error("Alerta no encontrada");
    alerta.estado = "resuelta";
    return mockResponse(alerta);
  }
  return api.post<Alerta>(`/api/v1/alerts/${id}/resolve`, {});
}
