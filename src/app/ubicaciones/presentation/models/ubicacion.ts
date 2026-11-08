export type EstadoUbicacion = "operativo" | "atencion";

export type Zona = {
  id: string;
  inmuebleId: string;
  nombre: string;
  nodos: number;
  estado: EstadoUbicacion;
};

export type InmuebleInput = { nombre: string; direccion: string };
export type ZonaInput = { nombre: string };

export type Inmueble = {
  id: string;
  nombre: string;
  direccion: string;
  zonas: Zona[];
  nodos: number;
  nodosEnLinea: number;
  estado: EstadoUbicacion;
};
