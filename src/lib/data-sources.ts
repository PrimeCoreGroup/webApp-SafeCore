// Origen de datos de cada módulo: "api" o "mock"
// VITE_USE_MOCKS=true fuerza todos a "mock"
type Source = "api" | "mock";

const forceMock = import.meta.env.VITE_USE_MOCKS === "true";
const api = (): Source => (forceMock ? "mock" : "api");

export const DATA_SOURCES = {
  auth: "mock", // sin endpoint de login
  dashboard: api(), // sensores y alertas
  sensores: api(), // Devices, SensorReadings
  alertas: api(), // RiskSituations
  usuarios: api(), // Users
  ubicaciones: "mock", // sin endpoints
  analitica: "mock", // sin endpoints
  configuracion: "mock", // no coincide con SystemConfigurations
} satisfies Record<string, Source>;

export type DataModule = keyof typeof DATA_SOURCES;

export function isMock(module: DataModule): boolean {
  return DATA_SOURCES[module] === "mock";
}
