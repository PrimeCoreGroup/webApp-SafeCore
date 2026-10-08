import type { Component } from "vue";
import {
  Activity,
  BellRing,
  CircleCheck,
  CircleSlash,
  Cpu,
  Droplets,
  Flame,
  Gauge,
  Thermometer,
  TriangleAlert,
  Waves,
  Wind,
} from "@lucide/vue";
import type { BadgeTone } from "@/app/shared/components/ui/AppBadge.vue";
import type { EstadoSensor, TipoSensor } from "../models/sensor";

export type TipoSensorUi = {
  label: string;
  descripcion: string;
  // Solo los sensores con magnitud medible admiten umbrales (US19)
  unidad: string | null;
  icono: Component;
};

export const SENSOR_TIPOS: Record<TipoSensor, TipoSensorUi> = {
  sismico: { label: "Sensor sísmico", descripcion: "Sísmico", unidad: "g", icono: Waves },
  temperatura: { label: "Sensor de temperatura", descripcion: "Temperatura", unidad: "°C", icono: Thermometer },
  humedad: { label: "Sensor de humedad", descripcion: "Humedad", unidad: "%", icono: Droplets },
  gas: { label: "Sensor de gas", descripcion: "Gas", unidad: "ppm", icono: Wind },
  humo: { label: "Sensor de humo", descripcion: "Humo", unidad: null, icono: Flame },
  movimiento: { label: "Sensor de movimiento", descripcion: "Movimiento", unidad: null, icono: Activity },
  sirena: { label: "Sirena", descripcion: "Alarma sonora", unidad: null, icono: BellRing },
  pulsador: { label: "Pulsador", descripcion: "Activación manual", unidad: null, icono: Gauge },
};

export const SENSOR_TIPO_OPCIONES = (Object.keys(SENSOR_TIPOS) as TipoSensor[]).map((value) => ({
  value,
  label: SENSOR_TIPOS[value].label,
}));

export const SENSOR_ESTADO_UI: Record<EstadoSensor, { label: string; tone: BadgeTone; icon: Component }> = {
  activo: { label: "Activo", tone: "success", icon: CircleCheck },
  alerta: { label: "Alerta", tone: "danger", icon: TriangleAlert },
  inactivo: { label: "Inactivo", tone: "neutral", icon: CircleSlash },
};

export const SENSOR_ICONO_DEFECTO = Cpu;
