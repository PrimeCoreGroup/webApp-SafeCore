import { api, USE_MOCKS } from "@/lib/api";
import { getAlertas } from "@/app/alertas/data/alertas.service";
import { getSensores } from "@/app/sensores/data/sensores.service";
import { getInmuebles } from "@/app/ubicaciones/data/ubicaciones.service";
import type { DashboardData } from "../presentation/models/dashboard";

// TODO(backend): confirmar si existirá un endpoint agregado para el dashboard o si se compone en el cliente.

// GET /api/v1/dashboard
export async function getDashboardData(): Promise<DashboardData> {
  if (!USE_MOCKS) return api.get<DashboardData>("/api/v1/dashboard");

  const [alertas, sensores, inmuebles] = await Promise.all([getAlertas(), getSensores(), getInmuebles()]);

  const activas = alertas.filter((a) => a.estado === "activa");
  const criticas = activas.filter((a) => a.severidad === "critica").length;
  const conectados = sensores.filter((s) => s.estado !== "inactivo").length;

  return {
    estadoGeneral: criticas
      ? { operativo: false, detalle: `${criticas} alerta${criticas === 1 ? "" : "s"} crítica${criticas === 1 ? "" : "s"}` }
      : { operativo: true, detalle: "Todos los sistemas activos" },
    alertasActivas: {
      valor: activas.length,
      detalle: criticas ? `${criticas} requiere${criticas === 1 ? "" : "n"} atención inmediata` : "Sin alertas críticas",
    },
    dispositivos: { valor: sensores.length, detalle: `${conectados} conectados` },
    conectividad: {
      valor: sensores.length ? Math.round((conectados / sensores.length) * 100) : 0,
      detalle: conectados === sensores.length ? "Red estable" : "Hay dispositivos sin conexión",
    },
    actividadReciente: alertas.slice(0, 3).map((a) => ({
      id: a.id,
      titulo: a.evento,
      lugar: a.ubicacion,
      tiempo: a.fecha,
      severidad: a.severidad,
    })),
    ubicaciones: inmuebles.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      dispositivos: i.dispositivos,
      dispositivosConectados: i.dispositivosConectados,
      estado: i.estado,
    })),
  };
}
