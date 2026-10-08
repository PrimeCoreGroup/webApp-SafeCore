import type { Alerta } from "../models/alerta";

export const mockAlertas: Alerta[] = [
  {
    id: "alt-001",
    evento: "Detección de humo",
    severidad: "critica",
    ubicacion: "Torre Norte · Piso 3",
    estado: "activa",
    fecha: "Hoy, 10:42",
    dispositivo: "Sensor de humo 03-A",
    dispositivoId: "SM-005",
    descripcion:
      "El sensor detectó presencia de humo por encima del umbral configurado. Se requiere verificar la zona y aplicar el protocolo de emergencia correspondiente.",
  },
  {
    id: "alt-002",
    evento: "Concentración de gas excedida",
    severidad: "critica",
    ubicacion: "Edificio Central · Recepción",
    estado: "activa",
    fecha: "Hoy, 09:51",
    dispositivo: "Sensor de gas",
    dispositivoId: "GAS-003",
    descripcion:
      "La concentración de gas superó el umbral máximo configurado. Verifica la ventilación de la zona y el corte de suministro si corresponde.",
  },
  {
    id: "alt-003",
    evento: "Conectividad intermitente",
    severidad: "advertencia",
    ubicacion: "Edificio Central",
    estado: "activa",
    fecha: "Hoy, 09:18",
    dispositivo: "Nodo Edge 03",
    dispositivoId: null,
    descripcion:
      "El nodo perdió comunicación con la plataforma de forma intermitente. Mientras tanto opera de forma autónoma con las funciones locales.",
  },
  {
    id: "alt-004",
    evento: "Prueba de protocolo",
    severidad: "informacion",
    ubicacion: "Sede Principal",
    estado: "resuelta",
    fecha: "Ayer, 16:30",
    dispositivo: "Sistema",
    dispositivoId: null,
    descripcion: "Se completó la prueba del protocolo de emergencia sin incidencias.",
  },
  {
    id: "alt-005",
    evento: "Temperatura elevada",
    severidad: "advertencia",
    ubicacion: "Torre Norte · Piso 1",
    estado: "archivada",
    fecha: "12 Jun, 14:05",
    dispositivo: "Sensor T-12",
    dispositivoId: "TEMP-012",
    descripcion: "La temperatura superó temporalmente el valor esperado y volvió a la normalidad.",
  },
];
