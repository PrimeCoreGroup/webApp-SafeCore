import type { Component } from "vue";
import {
  Activity,
  CircleCheck,
  CircleSlash,
  Cpu,
  DoorOpen,
  Flame,
  Lightbulb,
  PowerOff,
  Thermometer,
  TriangleAlert,
  Unplug,
  Volume2,
  Wrench,
} from "@lucide/vue";
import type { BadgeTone } from "@/app/shared/components/ui/AppBadge.vue";
import type { EstadoComponente, EstadoNodo, TipoActuador, TipoSensor } from "../models/nodo";

export const NODO_ESTADO_UI: Record<EstadoNodo, { label: string; tone: BadgeTone; icon: Component }> = {
  online: { label: "En línea", tone: "success", icon: CircleCheck },
  offline: { label: "Sin conexión", tone: "neutral", icon: CircleSlash },
  degraded: { label: "Degradado", tone: "warning", icon: TriangleAlert },
  maintenance: { label: "Mantenimiento", tone: "info", icon: Wrench },
};

export const COMPONENTE_ESTADO_UI: Record<EstadoComponente, { label: string; tone: BadgeTone; icon: Component }> = {
  ok: { label: "Operativo", tone: "success", icon: CircleCheck },
  fault: { label: "Con falla", tone: "danger", icon: TriangleAlert },
  disconnected: { label: "Desconectado", tone: "warning", icon: Unplug },
  maintenance: { label: "Mantenimiento", tone: "info", icon: Wrench },
  disabled: { label: "Deshabilitado", tone: "neutral", icon: PowerOff },
};

export const SENSOR_UI: Record<TipoSensor, { label: string; icono: Component }> = {
  temperatura: { label: "Temperatura", icono: Thermometer },
  humo: { label: "Humo y gas", icono: Flame },
  movimiento: { label: "Movimiento", icono: Activity },
  otro: { label: "Otro sensor", icono: Cpu },
};

export const ACTUADOR_UI: Record<TipoActuador, { label: string; icono: Component }> = {
  luces: { label: "Luces LED", icono: Lightbulb },
  sonido: { label: "Sonido", icono: Volume2 },
  servomotor: { label: "Servomotor de puerta", icono: DoorOpen },
  otro: { label: "Otro actuador", icono: Cpu },
};

// "otro" solo aparece al leer componentes desconocidos; no se ofrece al registrar
export const SENSOR_TIPOS = (Object.keys(SENSOR_UI) as TipoSensor[]).filter((t) => t !== "otro");
export const ACTUADOR_TIPOS = (Object.keys(ACTUADOR_UI) as TipoActuador[]).filter((t) => t !== "otro");

// Kit estándar que se propone al registrar un nodo
export const KIT_ESTANDAR = {
  sensores: ["temperatura", "humo", "movimiento"] as TipoSensor[],
  actuadores: ["luces", "sonido", "servomotor"] as TipoActuador[],
};
