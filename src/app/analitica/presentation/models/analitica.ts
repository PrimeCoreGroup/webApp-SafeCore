export type Periodo = 7 | 30 | 90;
export type Intervalo = "day" | "week" | "month";

export const PERIODOS: { valor: Periodo; etiqueta: string }[] = [
  { valor: 7, etiqueta: "7 días" },
  { valor: 30, etiqueta: "30 días" },
  { valor: 90, etiqueta: "90 días" },
];

export const INTERVALOS: { valor: Intervalo; etiqueta: string }[] = [
  { valor: "day", etiqueta: "Día" },
  { valor: "week", etiqueta: "Semana" },
  { valor: "month", etiqueta: "Mes" },
];

export type Desglose = { clave: string; etiqueta: string; cantidad: number };

export type ResumenAnalitica = {
  total: number;
  porTipo: Desglose[];
  porSeveridad: Desglose[];
  resueltasPct: number;
  // null si todavía no hay alertas resueltas
  tiempoRespuestaMin: number | null;
  disponibilidadPct: number;
};

export type PuntoTendencia = {
  fecha: string;
  registradas: number;
  atendidas: number;
};

export type Reporte = {
  id: string;
  nombre: string;
  descripcion: string;
  formato: string;
};

export const TIPOS_RIESGO: Record<string, string> = {
  Fire: "Incendio",
  GasOrSmoke: "Humo o gas",
  Earthquake: "Sismo o impacto",
  SensorFault: "Falla de sensor",
};

export const SEVERIDADES: Record<string, string> = {
  Critical: "Crítica",
  High: "Alta",
  Medium: "Media",
  Low: "Baja",
};
