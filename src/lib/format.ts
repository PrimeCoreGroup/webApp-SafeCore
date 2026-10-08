// Fecha y hora legibles (p. ej. "8 oct, 10:42")
export function formatFechaHora(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// "Hace 5 minutos"
export function tiempoRelativo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const minutos = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutos < 1) return "Hace menos de un minuto";
  if (minutos < 60) return `Hace ${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `Hace ${horas} hora${horas === 1 ? "" : "s"}`;
  const dias = Math.round(horas / 24);
  return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

// Quita tildes y pasa a minúsculas
export function normalizar(texto: string | null | undefined): string {
  return (texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}
