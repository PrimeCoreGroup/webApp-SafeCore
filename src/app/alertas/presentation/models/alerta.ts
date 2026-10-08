export type SeveridadAlerta = "critica" | "advertencia" | "informacion";
export type EstadoAlerta = "activa" | "resuelta" | "archivada";

export type Alerta = {
  id: string;
  evento: string;
  severidad: SeveridadAlerta;
  ubicacion: string;
  estado: EstadoAlerta;
  fecha: string;
  // Nombre del dispositivo que originó la alerta y, si es un sensor, su id
  dispositivo: string;
  dispositivoId: string | null;
  descripcion: string;
};
