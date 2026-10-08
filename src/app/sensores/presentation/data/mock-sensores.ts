import type { Sensor } from "../models/sensor";

// El código coincide con el id
type SensorMock = Omit<Sensor, "codigo">;

const sensores: SensorMock[] = [
  {
    id: "TEMP-001", nombre: "Sensor de temperatura", tipo: "temperatura",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-2", zonaNombre: "Piso 1",
    nodoId: "nodo-2", nodoNombre: "Nodo Edge 02", ultimaLectura: "24 °C", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 2 minutos", umbralMin: 5, umbralMax: 40,
  },
  {
    id: "HUM-002", nombre: "Sensor de humedad", tipo: "humedad",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-3", zonaNombre: "Piso 1 · Recepción",
    nodoId: "nodo-1", nodoNombre: "Nodo Edge 01", ultimaLectura: "65 %", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 1 minuto", umbralMin: 20, umbralMax: 80,
  },
  {
    id: "GAS-003", nombre: "Sensor de gas", tipo: "gas",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-1", zonaNombre: "Recepción",
    nodoId: "nodo-3", nodoNombre: "Nodo Edge 03", ultimaLectura: "850 ppm", estado: "alerta",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 30 segundos", umbralMin: null, umbralMax: 300,
  },
  {
    id: "MOV-004", nombre: "Sensor de movimiento", tipo: "movimiento",
    inmuebleId: "inm-3", inmuebleNombre: "Edificio Central", zonaId: "z-3-2", zonaNombre: "Entrada principal",
    nodoId: "nodo-3", nodoNombre: "Nodo Edge 03", ultimaLectura: null, estado: "inactivo",
    conectividad: "Sin conexión", ultimaComunicacion: "Hace 3 horas", umbralMin: null, umbralMax: null,
  },
  {
    id: "SM-005", nombre: "Sensor de humo 03-A", tipo: "humo",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-1", zonaNombre: "Piso 3",
    nodoId: "nodo-2", nodoNombre: "Nodo Edge 02", ultimaLectura: "Humo detectado", estado: "alerta",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 4 minutos", umbralMin: null, umbralMax: null,
  },
  {
    id: "SIS-006", nombre: "Sensor sísmico", tipo: "sismico",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-4", zonaNombre: "Estacionamiento",
    nodoId: "nodo-1", nodoNombre: "Nodo Edge 01", ultimaLectura: "0.01 g", estado: "activo",
    conectividad: "Conectado · Ethernet", ultimaComunicacion: "Hace 1 minuto", umbralMin: null, umbralMax: 0.15,
  },
  {
    id: "SIS-007", nombre: "Sensor sísmico", tipo: "sismico",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-2", zonaNombre: "Piso 1",
    nodoId: "nodo-2", nodoNombre: "Nodo Edge 02", ultimaLectura: "0.02 g", estado: "activo",
    conectividad: "Conectado · Ethernet", ultimaComunicacion: "Hace 2 minutos", umbralMin: null, umbralMax: 0.15,
  },
  {
    id: "TEMP-008", nombre: "Detector térmico 03-B", tipo: "temperatura",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-1", zonaNombre: "Piso 3 · Oficinas",
    nodoId: "nodo-4", nodoNombre: "Nodo Edge 04", ultimaLectura: "27 °C", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 2 minutos", umbralMin: 5, umbralMax: 60,
  },
  {
    id: "SIR-009", nombre: "Sirena 03-C", tipo: "sirena",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-1", zonaNombre: "Piso 3 · Oficinas",
    nodoId: "nodo-4", nodoNombre: "Nodo Edge 04", ultimaLectura: "En espera", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 5 minutos", umbralMin: null, umbralMax: null,
  },
  {
    id: "PUL-010", nombre: "Pulsador 03-D", tipo: "pulsador",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-1", zonaNombre: "Piso 3 · Oficinas",
    nodoId: "nodo-4", nodoNombre: "Nodo Edge 04", ultimaLectura: "En reposo", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 5 minutos", umbralMin: null, umbralMax: null,
  },
  {
    id: "HUM-011", nombre: "Sensor de humedad", tipo: "humedad",
    inmuebleId: "inm-1", inmuebleNombre: "Sede Principal", zonaId: "z-1-2", zonaNombre: "Piso 2 · Salas",
    nodoId: "nodo-1", nodoNombre: "Nodo Edge 01", ultimaLectura: "48 %", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 1 minuto", umbralMin: 20, umbralMax: 80,
  },
  {
    id: "TEMP-012", nombre: "Sensor T-12", tipo: "temperatura",
    inmuebleId: "inm-2", inmuebleNombre: "Torre Norte", zonaId: "z-2-2", zonaNombre: "Piso 1",
    nodoId: "nodo-2", nodoNombre: "Nodo Edge 02", ultimaLectura: "31 °C", estado: "activo",
    conectividad: "Conectado · Wi-Fi", ultimaComunicacion: "Hace 3 minutos", umbralMin: 5, umbralMax: 40,
  },
];

export const mockSensores: Sensor[] = sensores.map((s) => ({ ...s, codigo: s.id }));
