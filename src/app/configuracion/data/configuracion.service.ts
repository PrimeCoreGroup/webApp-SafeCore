import { api, mockResponse, USE_MOCKS } from "@/lib/api";
import { mockConfiguracion } from "../presentation/data/mock-configuracion";
import type { Configuracion } from "../presentation/models/configuracion";

// TODO(backend): los paths y el formato de los DTO están pendientes de confirmar con el equipo de backend.
// En modo mock los cambios se guardan solo en memoria (se pierden al recargar).
let configuracionMock: Configuracion = structuredClone(mockConfiguracion);

// GET /api/v1/settings
export async function getConfiguracion(): Promise<Configuracion> {
  if (USE_MOCKS) return mockResponse(configuracionMock);
  return api.get<Configuracion>("/api/v1/settings");
}

// PUT /api/v1/settings
export async function saveConfiguracion(config: Configuracion): Promise<Configuracion> {
  if (USE_MOCKS) {
    configuracionMock = structuredClone(config);
    return mockResponse(configuracionMock);
  }
  return api.put<Configuracion>("/api/v1/settings", config);
}
