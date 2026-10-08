import type { Component } from "vue";
import { CircleCheck, TriangleAlert } from "@lucide/vue";
import type { BadgeTone } from "@/app/shared/components/ui/AppBadge.vue";
import type { EstadoUbicacion } from "../models/ubicacion";

export const ESTADO_UBICACION_UI: Record<EstadoUbicacion, { label: string; tone: BadgeTone; icon: Component }> = {
  operativo: { label: "Operativo", tone: "success", icon: CircleCheck },
  atencion: { label: "Atención", tone: "warning", icon: TriangleAlert },
};
