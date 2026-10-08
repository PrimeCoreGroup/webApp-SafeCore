export type Indicador = { label: string; valor: number };

export type ResumenAnalitica = {
  alertasPeriodo: number;
  tendenciaAlertas: string;
  tiempoRespuestaMin: number;
  disponibilidad: number;
  // Eventos por intervalo del periodo (alto relativo de cada barra, 0–100)
  actividad: number[];
  indicadores: Indicador[];
};

export type Reporte = {
  id: string;
  nombre: string;
  periodo: string;
  ubicacion: string;
  tipo: string;
};

export type Tendencias = {
  alertasRegistradas: number[];
  alertasAtendidas: number[];
  variacionPeriodo: string;
  respuestaPromedioMin: number;
};
