import type { Configuracion } from "../models/configuracion";

export const mockConfiguracion: Configuracion = {
  nombreSistema: "SafeCore Principal",
  zonaHoraria: "America/Lima",
  protocolos: { alertasCriticas: true, notificarResponsables: true, confirmacionManual: false },
  preferencias: { notificacionesSistema: true, resumenActividad: true, alertasInformativas: false },
};
