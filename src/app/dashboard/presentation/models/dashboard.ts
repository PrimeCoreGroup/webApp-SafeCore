import type { SeveridadAlerta } from "@/app/alertas/presentation/models/alerta";
import type { EstadoUbicacion } from "@/app/ubicaciones/presentation/models/ubicacion";

export type ActividadReciente = {
  id: string;
  titulo: string;
  lugar: string;
  tiempo: string;
  severidad: SeveridadAlerta;
};

export type UbicacionResumen = {
  id: string;
  nombre: string;
  nodos: number;
  nodosEnLinea: number;
  estado: EstadoUbicacion;
};

export type DashboardData = {
  estadoGeneral: { operativo: boolean; detalle: string };
  alertasActivas: { valor: number; detalle: string };
  nodos: { valor: number; detalle: string };
  conectividad: { valor: number; detalle: string };
  actividadReciente: ActividadReciente[];
  ubicaciones: UbicacionResumen[];
};
