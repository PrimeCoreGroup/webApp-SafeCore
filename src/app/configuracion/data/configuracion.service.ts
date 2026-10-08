import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { mockConfiguracion } from "../presentation/data/mock-configuracion";
import type { Configuracion } from "../presentation/models/configuracion";

// Datos de ejemplo (SystemConfigurations no cubre estas opciones). Los endpoints son supuestos.
let configuracionMock: Configuracion = structuredClone(mockConfiguracion);

// GET /api/v1/settings
export async function getConfiguracion(): Promise<Configuracion> {
  if (isMock("configuracion")) return mockResponse(configuracionMock);
  return api.get<Configuracion>("/api/v1/settings");
}

// PUT /api/v1/settings
export async function saveConfiguracion(config: Configuracion): Promise<Configuracion> {
  if (isMock("configuracion")) {
    configuracionMock = structuredClone(config);
    return mockResponse(configuracionMock);
  }
  return api.put<Configuracion>("/api/v1/settings", config);
}
