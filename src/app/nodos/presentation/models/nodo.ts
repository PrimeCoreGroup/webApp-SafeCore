export type EstadoNodo = "online" | "offline" | "degraded" | "maintenance";

export type TipoSensor = "temperatura" | "humo" | "movimiento";
export type TipoActuador = "luces" | "sonido" | "servomotor";

export type SensorNodo = {
  id: string;
  tipo: TipoSensor;
  nombre: string;
  ultimaLectura: string | null;
};

export type ActuadorNodo = {
  id: string;
  tipo: TipoActuador;
  nombre: string;
};

// Cada elemento es un componente del nodo; un tipo puede repetirse
export type ComponentesNodo = {
  sensores: TipoSensor[];
  actuadores: TipoActuador[];
};

export type Nodo = {
  // Id interno (en el backend es un UUID)
  id: string;
  // Número de serie del controlador
  codigo: string;
  nombre: string;
  estado: EstadoNodo;
  creadoEn: string;
  ultimaComunicacion: string;
  inmuebleId: string;
  inmuebleNombre: string;
  zonaId: string;
  zonaNombre: string;
  sensores: SensorNodo[];
  actuadores: ActuadorNodo[];
  // Quién registró el nodo (el backend aún no lo guarda)
  registradoPor: string | null;
};

// Datos del formulario de registro / edición
export type NodoInput = ComponentesNodo & {
  codigo: string;
  nombre: string;
  estado: EstadoNodo;
};

// Respuesta al registrar o rotar: el secreto solo se entrega una vez
export type NodoConSecreto = { nodo: Nodo; secreto: string };

export type NodoFiltros = {
  busqueda: string;
  estado: EstadoNodo | "";
};
