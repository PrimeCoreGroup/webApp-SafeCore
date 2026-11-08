import type { PuntoTendencia, Reporte, ResumenAnalitica } from "../models/analitica";

export const mockResumen: ResumenAnalitica = {
  total: 24,
  porTipo: [
    { clave: "Fire", etiqueta: "Incendio", cantidad: 6 },
    { clave: "GasOrSmoke", etiqueta: "Humo o gas", cantidad: 9 },
    { clave: "Earthquake", etiqueta: "Sismo o impacto", cantidad: 5 },
    { clave: "SensorFault", etiqueta: "Falla de sensor", cantidad: 4 },
  ],
  porSeveridad: [
    { clave: "Critical", etiqueta: "Crítica", cantidad: 8 },
    { clave: "High", etiqueta: "Alta", cantidad: 6 },
    { clave: "Medium", etiqueta: "Media", cantidad: 7 },
    { clave: "Low", etiqueta: "Baja", cantidad: 3 },
  ],
  resueltasPct: 91,
  tiempoRespuestaMin: 4,
  disponibilidadPct: 96,
};

export function mockTendencias(dias: number): PuntoTendencia[] {
  const base = [3, 5, 4, 7, 5, 6, 3, 5, 8, 6, 5, 7];
  return Array.from({ length: Math.min(dias, 12) }, (_, i) => {
    const registradas = base[i % base.length]!;
    const fecha = new Date(Date.now() - (Math.min(dias, 12) - 1 - i) * 86400000).toISOString();
    return { fecha, registradas, atendidas: Math.max(0, registradas - (i % 3)) };
  });
}

export const mockReportes: Reporte[] = [
  { id: "alerts-summary", nombre: "Resumen de alertas", descripcion: "Riesgos por tipo, severidad y estado para un periodo.", formato: "json" },
  { id: "device-status", nombre: "Estado de dispositivos", descripcion: "Estado actual y última comunicación de los nodos visibles.", formato: "json" },
  { id: "operations", nombre: "Actividad operativa", descripcion: "Tendencia temporal de alertas registradas y atendidas.", formato: "json" },
];
