import type { Reporte, ResumenAnalitica, Tendencias } from "../models/analitica";

export const mockResumen: ResumenAnalitica = {
  alertasPeriodo: 24,
  tendenciaAlertas: "Tendencia estable",
  tiempoRespuestaMin: 4,
  disponibilidad: 98,
  actividad: [45, 62, 48, 75, 55, 68, 42, 58, 82, 64, 52, 70],
  indicadores: [
    { label: "Alertas atendidas", valor: 91 },
    { label: "Dispositivos conectados", valor: 96 },
    { label: "Protocolos completados", valor: 88 },
  ],
};

export const mockReportes: Reporte[] = [
  { id: "rep-1", nombre: "Resumen de alertas", periodo: "Periodo actual", ubicacion: "Todas las ubicaciones", tipo: "Información operativa" },
  { id: "rep-2", nombre: "Estado de dispositivos", periodo: "Últimos 30 días", ubicacion: "Sede Principal", tipo: "Información operativa" },
  { id: "rep-3", nombre: "Actividad operativa", periodo: "Periodo anterior", ubicacion: "Todas las ubicaciones", tipo: "Información operativa" },
];

export const mockTendencias: Tendencias = {
  alertasRegistradas: [30, 55, 45, 20, 35, 15, 25, 10, 20],
  alertasAtendidas: [15, 25, 35, 20, 30, 25, 40, 20, 30],
  variacionPeriodo: "-8%",
  respuestaPromedioMin: 4,
};
