import type { Component } from "vue";
import { Bell, ChartColumn, Cpu, House, MapPin, Settings, Users } from "@lucide/vue";

export type NavItem = {
  label: string;
  icon: Component;
  route: string;
};

export const navigation: NavItem[] = [
  { label: "Panel principal", icon: House, route: "/dashboard" },
  { label: "Ubicaciones", icon: MapPin, route: "/ubicaciones" },
  { label: "Alertas", icon: Bell, route: "/alertas" },
  { label: "Analítica", icon: ChartColumn, route: "/analitica" },
  { label: "Usuarios", icon: Users, route: "/usuarios" },
  { label: "Configuración", icon: Settings, route: "/configuracion" },
  { label: "Nodos", icon: Cpu, route: "/nodos" },
];
