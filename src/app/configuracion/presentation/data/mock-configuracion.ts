import type { Configuracion } from "../models/configuracion";

export const mockConfiguracion: Configuracion = {
  nombreSistema: "SafeCore Principal",
  zonaHoraria: "America/Lima",
  alertasCriticas: true,
  notificarResponsables: true,
  confirmacionManual: false,
  umbrales: { temperaturaCelsius: 40, gasAdcSubida: 100, aceleracionDelta: 200, impactoMs: 1500 },
};
