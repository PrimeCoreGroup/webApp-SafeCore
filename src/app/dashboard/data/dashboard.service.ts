import { isMock } from "@/lib/data-sources";
import { getAlertas } from "@/app/alertas/data/alertas.service";
import { getNodos } from "@/app/nodos/data/nodos.service";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import type { DashboardData } from "../presentation/models/dashboard";

// Se compone en el cliente con alertas y nodos (no hay endpoint de dashboard)
export async function getDashboardData(): Promise<DashboardData> {
  const [alertas, nodos] = await Promise.all([getAlertas(), getNodos()]);

  const activas = alertas.filter((a) => a.estado === "activa");
  const criticas = activas.filter((a) => a.severidad === "critica").length;
  const enLinea = nodos.filter((n) => n.estado === "online").length;

  const inmuebles = isMock("nodos") ? await getInmuebles() : null;

  return {
    estadoGeneral: criticas
      ? { operativo: false, detalle: `${criticas} alerta${criticas === 1 ? "" : "s"} crítica${criticas === 1 ? "" : "s"}` }
      : { operativo: true, detalle: "Sin alertas críticas" },
    alertasActivas: {
      valor: activas.length,
      detalle: criticas ? `${criticas} requiere${criticas === 1 ? "" : "n"} atención inmediata` : "Sin alertas críticas",
    },
    nodos: { valor: nodos.length, detalle: `${enLinea} en línea` },
    conectividad: {
      valor: nodos.length ? Math.round((enLinea / nodos.length) * 100) : 0,
      detalle: !nodos.length
        ? "Sin nodos registrados"
        : enLinea === nodos.length
          ? "Red estable"
          : "Hay nodos sin conexión",
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
        nodos: i.nodos,
        nodosEnLinea: i.nodosEnLinea,
        estado: i.estado,
      })) ?? null,
  };
}
