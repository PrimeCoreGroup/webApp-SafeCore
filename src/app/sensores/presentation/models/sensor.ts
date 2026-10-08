export type TipoSensor =
  | "sismico"
  | "temperatura"
  | "humedad"
  | "gas"
  | "humo"
  | "movimiento"
  | "sirena"
  | "pulsador";

export type EstadoSensor = "activo" | "alerta" | "inactivo";

export type Sensor = {
  // Identificador del dispositivo (p. ej. TEMP-001); también se usa en la URL
  id: string;
  nombre: string;
  tipo: TipoSensor;
  inmuebleId: string;
  inmuebleNombre: string;
  zonaId: string;
  zonaNombre: string;
  nodoId: string;
  nodoNombre: string;
  ultimaLectura: string | null;
  estado: EstadoSensor;
  conectividad: string;
  ultimaComunicacion: string;
  umbralMin: number | null;
  umbralMax: number | null;
};

export type Lectura = { fecha: string; valor: string };

// Datos que envía el formulario de registro / edición
export type SensorInput = {
  id: string;
  nombre: string;
  tipo: TipoSensor;
  inmuebleId: string;
  zonaId: string;
  nodoId: string;
  umbralMin: number | null;
  umbralMax: number | null;
  estado: EstadoSensor;
};

export type SensorFiltros = {
  busqueda: string;
  tipo: TipoSensor | "";
  estado: EstadoSensor | "";
  inmuebleId: string;
};
