import type { EstadoNodo, TipoActuador, TipoSensor } from "../models/nodo";

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
  sensores: { tipo: TipoSensor; ultimaLectura: string | null }[];
  actuadores: TipoActuador[];
};

const KIT_SENSORES = (temp: string, humo: string, mov: string) => [
  { tipo: "temperatura" as const, ultimaLectura: temp },
  { tipo: "humo" as const, ultimaLectura: humo },
  { tipo: "movimiento" as const, ultimaLectura: mov },
];

export const mockNodos: NodoMock[] = [
  {
    id: "nodo-001", codigo: "NODO-001", nombre: "Nodo Recepción", estado: "online",
    creadoEn: "2 oct, 09:15", ultimaComunicacion: "Hace 1 minuto",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-3", zonaNombre: "Piso 1 · Recepción",
    registradoPor: "María López",
    sensores: KIT_SENSORES("24 °C", "Normal", "X 160 · Y -80 · Z 16300"),
    actuadores: ["luces", "sonido", "servomotor"],
  },
  {
    id: "nodo-002", codigo: "NODO-002", nombre: "Nodo Oficinas", estado: "online",
    creadoEn: "2 oct, 09:40", ultimaComunicacion: "Hace 2 minutos",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-1", zonaNombre: "Piso 3 · Oficinas",
    registradoPor: "María López",
    sensores: KIT_SENSORES("27 °C", "Normal", "X 150 · Y -70 · Z 16280"),
    actuadores: ["luces", "sonido", "servomotor"],
  },
  {
    id: "nodo-003", codigo: "NODO-003", nombre: "Nodo Estacionamiento", estado: "degraded",
    creadoEn: "3 oct, 11:05", ultimaComunicacion: "Hace 12 minutos",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-4", zonaNombre: "Estacionamiento",
    registradoPor: "Alex Rivera",
    sensores: [
      { tipo: "temperatura", ultimaLectura: "29 °C" },
      { tipo: "humo", ultimaLectura: "Normal" },
    ],
    actuadores: ["sonido"],
  },
  {
    id: "nodo-004", codigo: "NODO-004", nombre: "Nodo Piso 3", estado: "online",
    creadoEn: "4 oct, 15:20", ultimaComunicacion: "Hace 4 minutos",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-1", zonaNombre: "Piso 3",
    registradoPor: "María López",
    sensores: KIT_SENSORES("38 °C", "Humo detectado", "X 155 · Y -75 · Z 16310"),
    actuadores: ["luces", "sonido", "servomotor"],
  },
  {
    id: "nodo-005", codigo: "NODO-005", nombre: "Nodo Piso 1", estado: "offline",
    creadoEn: "4 oct, 16:00", ultimaComunicacion: "Hace 3 horas",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-2", zonaNombre: "Piso 1",
    registradoPor: "María López",
    sensores: [
      { tipo: "temperatura", ultimaLectura: null },
      { tipo: "movimiento", ultimaLectura: null },
    ],
    actuadores: ["luces", "sonido"],
  },
  {
    id: "nodo-006", codigo: "NODO-006", nombre: "Nodo Recepción Central", estado: "online",
    creadoEn: "5 oct, 10:30", ultimaComunicacion: "Hace 30 segundos",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-1", zonaNombre: "Recepción",
    registradoPor: "Alex Rivera",
    sensores: KIT_SENSORES("26 °C", "Gas elevado", "X 158 · Y -78 · Z 16295"),
    actuadores: ["luces", "sonido", "servomotor"],
  },
  {
    id: "nodo-007", codigo: "NODO-007", nombre: "Nodo Sótano", estado: "maintenance",
    creadoEn: "5 oct, 12:10", ultimaComunicacion: "Hace 1 día",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-3", zonaNombre: "Sótano",
    registradoPor: "Alex Rivera",
    sensores: [{ tipo: "temperatura", ultimaLectura: "22 °C" }],
    actuadores: ["sonido"],
  },
];
