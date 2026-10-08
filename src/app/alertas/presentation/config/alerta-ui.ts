import type { Component } from "vue";
import { Info, TriangleAlert } from "@lucide/vue";
import type { BadgeTone } from "@/app/shared/components/ui/AppBadge.vue";
import type { EstadoAlerta, SeveridadAlerta } from "../models/alerta";

export const SEVERIDAD_UI: Record<
  SeveridadAlerta,
  { label: string; tone: BadgeTone; icon: Component; iconClass: string }
> = {
  critica: { label: "Crítica", tone: "danger", icon: TriangleAlert, iconClass: "text-danger" },
  advertencia: { label: "Advertencia", tone: "warning", icon: TriangleAlert, iconClass: "text-amber-600" },
  informacion: { label: "Información", tone: "info", icon: Info, iconClass: "text-brand-dark" },
};

export const ESTADO_ALERTA_LABEL: Record<EstadoAlerta, string> = {
  activa: "Activa",
  resuelta: "Resuelta",
  archivada: "Archivada",
};
