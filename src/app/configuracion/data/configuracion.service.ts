import { api, mockResponse } from "@/lib/api";
import { isMock } from "@/lib/data-sources";
import { mockConfiguracion } from "../presentation/data/mock-configuracion";
import type { Configuracion } from "../presentation/models/configuracion";

// Usa Settings; con VITE_USE_MOCKS=true usa datos de ejemplo.

type SettingsApi = {
  systemName: string;
  timeZone: string;
  criticalAlertsEnabled: boolean;
  notifyResponders: boolean;
  manualConfirmation: boolean;
  thresholds: {
    temperatureCelsius: number;
    gasAdcRiseCounts: number;
    accelerationMagnitudeDeltaCounts: number;
    impactAlertMilliseconds: number;
  };
};

function configuracionDesdeApi(s: SettingsApi): Configuracion {
  return {
    nombreSistema: s.systemName,
    zonaHoraria: s.timeZone,
    alertasCriticas: s.criticalAlertsEnabled,
    notificarResponsables: s.notifyResponders,
    confirmacionManual: s.manualConfirmation,
    umbrales: {
      temperaturaCelsius: s.thresholds.temperatureCelsius,
      gasAdcSubida: s.thresholds.gasAdcRiseCounts,
      aceleracionDelta: s.thresholds.accelerationMagnitudeDeltaCounts,
      impactoMs: s.thresholds.impactAlertMilliseconds,
    },
  };
}

let configuracionMock: Configuracion = structuredClone(mockConfiguracion);

// GET /api/settings
export async function getConfiguracion(): Promise<Configuracion> {
  if (isMock("configuracion")) return mockResponse(configuracionMock);
  return configuracionDesdeApi(await api.get<SettingsApi>("/api/settings"));
}

// PUT /api/settings y PUT /api/settings/thresholds
export async function saveConfiguracion(config: Configuracion): Promise<Configuracion> {
  if (isMock("configuracion")) {
    configuracionMock = structuredClone(config);
    return mockResponse(configuracionMock);
  }
  await api.put<SettingsApi>("/api/settings", {
    systemName: config.nombreSistema,
    timeZone: config.zonaHoraria,
    criticalAlertsEnabled: config.alertasCriticas,
    notifyResponders: config.notificarResponsables,
    manualConfirmation: config.confirmacionManual,
  });
  await api.put("/api/settings/thresholds", {
    temperatureCelsius: config.umbrales.temperaturaCelsius,
    gasAdcRiseCounts: config.umbrales.gasAdcSubida,
    accelerationMagnitudeDeltaCounts: config.umbrales.aceleracionDelta,
    impactAlertMilliseconds: config.umbrales.impactoMs,
  });
  return getConfiguracion();
}
