export type Configuracion = {
  nombreSistema: string;
  zonaHoraria: string;
  protocolos: {
    alertasCriticas: boolean;
    notificarResponsables: boolean;
    confirmacionManual: boolean;
  };
  preferencias: {
    notificacionesSistema: boolean;
    resumenActividad: boolean;
    alertasInformativas: boolean;
  };
};

export const ZONAS_HORARIAS = [
  { value: "America/Lima", label: "Lima (UTC−5)" },
  { value: "America/Bogota", label: "Bogotá (UTC−5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (UTC−6)" },
  { value: "America/Santiago", label: "Santiago (UTC−4)" },
  { value: "UTC", label: "UTC" },
];
