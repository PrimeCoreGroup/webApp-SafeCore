export type EstadoUbicacion = "operativo" | "atencion";

export type Zona = {
  id: string;
  inmuebleId: string;
  nombre: string;
  dispositivos: number;
  estado: EstadoUbicacion;
};

export type Inmueble = {
  id: string;
  nombre: string;
  direccion: string;
  zonas: Zona[];
  dispositivos: number;
  dispositivosConectados: number;
  estado: EstadoUbicacion;
};

// Un inmueble puede tener varios nodos Edge; cada sensor se asocia a uno.
export type NodoEdge = {
  id: string;
  nombre: string;
  inmuebleId: string;
  bateria: number;
  conectividad: "online" | "offline";
};
