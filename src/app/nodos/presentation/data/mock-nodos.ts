import type {
  ComponenteNodo,
  EstadoComponente,
  EstadoNodo,
  TipoActuador,
  TipoSensor,
} from "../models/nodo";

export type NodoMock = {
  id: string;
  codigo: string;
  nombre: string;
  estado: EstadoNodo;
  creadoEn: string;
  ultimaComunicacion: string;
  inmuebleId: string;
  inmuebleNombre: string;
  zonaId: string;
  zonaNombre: string;
  registradoPor: string | null;
  sensores: { tipo: TipoSensor; nombre: string; ultimaLectura: string | null; estado: EstadoComponente }[];
  actuadores: { tipo: TipoActuador; nombre: string; estado: EstadoComponente }[];
};

const KIT = (temp: string, humo: string, mov: string) => ({
  sensores: [
    { tipo: "temperatura" as const, nombre: "Temperatura", ultimaLectura: temp, estado: "ok" as const },
    { tipo: "humo" as const, nombre: "Humo y gas", ultimaLectura: humo, estado: "ok" as const },
    { tipo: "movimiento" as const, nombre: "Movimiento", ultimaLectura: mov, estado: "ok" as const },
  ],
  actuadores: [
    { tipo: "luces" as const, nombre: "Luces LED", estado: "ok" as const },
    { tipo: "sonido" as const, nombre: "Sonido", estado: "ok" as const },
    { tipo: "servomotor" as const, nombre: "Servomotor de puerta", estado: "ok" as const },
  ],
});

export const mockNodos: NodoMock[] = [
  {
    id: "nodo-001", codigo: "NODO-001", nombre: "Nodo Recepción", estado: "online",
    creadoEn: "2 oct, 09:15", ultimaComunicacion: "Hace 1 minuto",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-3", zonaNombre: "Piso 1 · Recepción",
    registradoPor: "María López",
    ...KIT("24 °C", "Normal", "X 160 · Y -80 · Z 16300"),
  },
  {
    id: "nodo-002", codigo: "NODO-002", nombre: "Nodo Oficinas", estado: "online",
    creadoEn: "2 oct, 09:40", ultimaComunicacion: "Hace 2 minutos",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-1", zonaNombre: "Piso 3 · Oficinas",
    registradoPor: "María López",
    ...KIT("27 °C", "Normal", "X 150 · Y -70 · Z 16280"),
  },
  {
    id: "nodo-003", codigo: "NODO-003", nombre: "Nodo Estacionamiento", estado: "degraded",
    creadoEn: "3 oct, 11:05", ultimaComunicacion: "Hace 12 minutos",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-4", zonaNombre: "Estacionamiento",
    registradoPor: "Alex Rivera",
    sensores: [
      { tipo: "temperatura", nombre: "Temperatura", ultimaLectura: "29 °C", estado: "ok" },
      { tipo: "humo", nombre: "Humo y gas", ultimaLectura: null, estado: "fault" },
    ],
    actuadores: [{ tipo: "sonido", nombre: "Sonido", estado: "ok" }],
  },
  {
    id: "nodo-004", codigo: "NODO-004", nombre: "Nodo Piso 3", estado: "online",
    creadoEn: "4 oct, 15:20", ultimaComunicacion: "Hace 4 minutos",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-1", zonaNombre: "Piso 3",
    registradoPor: "María López",
    ...KIT("38 °C", "Humo detectado", "X 155 · Y -75 · Z 16310"),
  },
  {
    id: "nodo-005", codigo: "NODO-005", nombre: "Nodo Piso 1", estado: "offline",
    creadoEn: "4 oct, 16:00", ultimaComunicacion: "Hace 3 horas",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-2", zonaNombre: "Piso 1",
    registradoPor: "María López",
    sensores: [
      { tipo: "temperatura", nombre: "Temperatura", ultimaLectura: null, estado: "disconnected" },
      { tipo: "movimiento", nombre: "Movimiento", ultimaLectura: null, estado: "disconnected" },
    ],
    actuadores: [
      { tipo: "luces", nombre: "Luces LED", estado: "disconnected" },
      { tipo: "sonido", nombre: "Sonido", estado: "disconnected" },
    ],
  },
  {
    id: "nodo-006", codigo: "NODO-006", nombre: "Nodo Recepción Central", estado: "online",
    creadoEn: "5 oct, 10:30", ultimaComunicacion: "Hace 30 segundos",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-1", zonaNombre: "Recepción",
    registradoPor: "Alex Rivera",
    ...KIT("26 °C", "Gas elevado", "X 158 · Y -78 · Z 16295"),
  },
  {
    id: "nodo-007", codigo: "NODO-007", nombre: "Nodo Sótano", estado: "maintenance",
    creadoEn: "5 oct, 12:10", ultimaComunicacion: "Hace 1 día",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-3", zonaNombre: "Sótano",
    registradoPor: "Alex Rivera",
    sensores: [{ tipo: "temperatura", nombre: "Temperatura", ultimaLectura: "22 °C", estado: "maintenance" }],
    actuadores: [{ tipo: "sonido", nombre: "Sonido", estado: "maintenance" }],
  },
];

export type ComponenteMock = Pick<ComponenteNodo, "tipo" | "nombre" | "estado">;
