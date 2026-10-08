import { isMock } from "@/lib/data-sources";
import { getAlertas } from "@/app/alertas/data/alertas.service";
import { getSensores } from "@/app/sensores/data/sensores.service";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import type { DashboardData } from "../presentation/models/dashboard";

// Se compone en el cliente con alertas y sensores (no hay endpoint de dashboard)
export async function getDashboardData(): Promise<DashboardData> {
  const [alertas, sensores] = await Promise.all([getAlertas(), getSensores()]);

  const activas = alertas.filter((a) => a.estado === "activa");
  const criticas = activas.filter((a) => a.severidad === "critica").length;
  const conectados = sensores.filter((s) => s.estado !== "inactivo").length;

  const inmuebles = isMock("sensores") ? await getInmuebles() : null;

  return {
    estadoGeneral: criticas
      ? { operativo: false, detalle: `${criticas} alerta${criticas === 1 ? "" : "s"} crítica${criticas === 1 ? "" : "s"}` }
      : { operativo: true, detalle: "Sin alertas críticas" },
    alertasActivas: {
      valor: activas.length,
      detalle: criticas ? `${criticas} requiere${criticas === 1 ? "" : "n"} atención inmediata` : "Sin alertas críticas",
    },
    dispositivos: { valor: sensores.length, detalle: `${conectados} conectados` },
    conectividad: {
      valor: sensores.length ? Math.round((conectados / sensores.length) * 100) : 0,
      detalle: !sensores.length
        ? "Sin dispositivos registrados"
        : conectados === sensores.length
          ? "Red estable"
          : "Hay dispositivos sin conexión",
    },
    actividadReciente: alertas.slice(0, 3).map((a) => ({
      id: a.id,
      titulo: a.evento,
      lugar: a.ubicacion,
      tiempo: a.fecha,
      severidad: a.severidad,
    })),
    ubicaciones:
      inmuebles?.map((i) => ({
        id: i.id,
        nombre: i.nombre,
        dispositivos: i.dispositivos,
        dispositivosConectados: i.dispositivosConectados,
        estado: i.estado,
      })) ?? null,
  };
}
