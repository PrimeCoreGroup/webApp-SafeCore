export type EstadoNodo = "online" | "offline" | "degraded" | "maintenance";
export type EstadoComponente = "ok" | "fault" | "disconnected" | "maintenance" | "disabled";

export type TipoSensor = "temperatura" | "humo" | "movimiento" | "otro";
export type TipoActuador = "luces" | "sonido" | "servomotor" | "otro";
export type ClaseComponente = "sensor" | "actuador";

export type ComponenteNodo = {
  id: string;
  clase: ClaseComponente;
  tipo: TipoSensor | TipoActuador;
  // Etiqueta que identifica al componente dentro del nodo
  nombre: string;
  canal: string | null;
  estado: EstadoComponente;
  ultimaSenal: string | null;
  // Solo sensores: última lectura recibida
  ultimaLectura: string | null;
  instaladoEn: string | null;
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
  sensores: ComponenteNodo[];
  actuadores: ComponenteNodo[];
  registradoPor: string | null;
};

// Kit inicial al registrar un nodo: cantidad de cada tipo
export type KitNodo = {
  sensores: TipoSensor[];
  actuadores: TipoActuador[];
};

// Datos del formulario de registro / edición
export type NodoInput = {
  codigo: string;
  nombre: string;
  estado: EstadoNodo;
  zonaId: string | null;
  kit: KitNodo;
};

// Datos del formulario de un componente
export type ComponenteInput = {
  clase: ClaseComponente;
  tipo: TipoSensor | TipoActuador;
  nombre: string;
  canal: string | null;
  estado: EstadoComponente;
};

// Respuesta al registrar o rotar: el secreto solo se entrega una vez
export type NodoConSecreto = { nodo: Nodo; secreto: string; aviso: string | null };

export type ResultadoPrueba = { estado: "completed" | "failed" | "pending"; detalle: string | null };

export type NodoFiltros = {
  busqueda: string;
  estado: EstadoNodo | "";
};

export function componentesConFalla(nodo: Pick<Nodo, "sensores" | "actuadores">): number {
  return [...nodo.sensores, ...nodo.actuadores].filter((c) => c.estado === "fault").length;
}
