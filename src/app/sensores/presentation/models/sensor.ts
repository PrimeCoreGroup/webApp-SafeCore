export type TipoSensor =
  | "sismico"
  | "temperatura"
  | "humedad"
  | "gas"
  | "humo"
  | "movimiento"
  | "sirena"
  | "pulsador"
  // Categoría desconocida del backend
  | "otro";

export type EstadoSensor = "activo" | "alerta" | "inactivo";

export type Sensor = {
  // Id interno (en el backend es un UUID)
  id: string;
  // Código visible; en el backend es el serialNumber
  codigo: string;
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

// Datos del formulario
export type SensorInput = {
  // Código (serialNumber)
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
