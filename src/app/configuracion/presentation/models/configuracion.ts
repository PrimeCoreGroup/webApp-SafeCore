export type Umbrales = {
  temperaturaCelsius: number;
  gasAdcSubida: number;
  aceleracionDelta: number;
  impactoMs: number;
};

export type Configuracion = {
  nombreSistema: string;
  zonaHoraria: string;
  alertasCriticas: boolean;
  notificarResponsables: boolean;
  confirmacionManual: boolean;
  umbrales: Umbrales;
};

export const ZONAS_HORARIAS = [
  { value: "America/Lima", label: "Lima (UTC−5)" },
  { value: "America/Bogota", label: "Bogotá (UTC−5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (UTC−6)" },
  { value: "America/Santiago", label: "Santiago (UTC−4)" },
  { value: "UTC", label: "UTC" },
];

export type CampoUmbral = {
  clave: keyof Umbrales;
  etiqueta: string;
  descripcion: string;
  rango: string;
  min: number;
  max: number;
  // El mínimo no se incluye en el rango válido
  minExclusivo: boolean;
  entero: boolean;
};

export const CAMPOS_UMBRAL: CampoUmbral[] = [
  {
    clave: "temperaturaCelsius",
    etiqueta: "Temperatura de incendio (°C)",
    descripcion: "Se genera una alerta de incendio al alcanzar esta temperatura.",
    rango: "Mayor que -55 y hasta 125",
    min: -55,
    max: 125,
    minExclusivo: true,
    entero: false,
  },
  {
    clave: "gasAdcSubida",
    etiqueta: "Aumento de gas (cuentas ADC)",
    descripcion: "Subida entre dos lecturas que activa una alerta de humo o gas.",
    rango: "Mayor que 0 y hasta 4095",
    min: 0,
    max: 4095,
    minExclusivo: true,
    entero: false,
  },
  {
    clave: "aceleracionDelta",
    etiqueta: "Cambio de movimiento (cuentas)",
    descripcion: "Variación del acelerómetro que se considera un impacto o sismo.",
    rango: "Mayor que 0 y hasta 56755",
    min: 0,
    max: 56755,
    minExclusivo: true,
    entero: false,
  },
  {
    clave: "impactoMs",
    etiqueta: "Duración de la alerta de impacto (ms)",
    descripcion: "Tiempo que se mantiene activa la alerta tras un impacto.",
    rango: "Entre 100 y 10000",
    min: 100,
    max: 10000,
    minExclusivo: false,
    entero: true,
  },
];
