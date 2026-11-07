// Traduce los mensajes del backend (en inglés) a mensajes para el usuario
const TRADUCCIONES: [RegExp, string][] = [
  [/device with this serial number already exists/i, "Ya existe un nodo con ese número de serie."],
  [/device with recorded sensor readings cannot be deleted/i, "No se puede eliminar un nodo con lecturas registradas."],
  [/cannot disable their own account/i, "Un administrador no puede desactivar su propia cuenta."],
  [/cannot delete their own account/i, "Un administrador no puede eliminar su propia cuenta."],
  [/last administrator account cannot be deleted/i, "No se puede eliminar al último administrador."],
  [/notification records cannot be deleted/i, "Este usuario tiene notificaciones; desactívalo en lugar de eliminarlo."],
  [/risk referenced by an emergency response cannot be deleted/i, "No se puede eliminar un riesgo con una respuesta de emergencia."],
  [/already taken/i, "Ya existe un usuario con ese correo."],
  [/passwords must be at least/i, "La contraseña debe tener al menos 12 caracteres."],
  [/non alphanumeric/i, "La contraseña debe incluir un símbolo."],
  [/passwords must have at least one digit/i, "La contraseña debe incluir un número."],
  [/passwords must have at least one uppercase/i, "La contraseña debe incluir una mayúscula."],
  [/passwords must have at least one lowercase/i, "La contraseña debe incluir una minúscula."],
];

function traducir(texto: string): string {
  return TRADUCCIONES.find(([patron]) => patron.test(texto))?.[1] ?? texto;
}

type CuerpoError = { errors?: unknown; title?: string; message?: string } | null;

export function mensajeDeError(status: number, body: CuerpoError, esLogin: boolean): string {
  if (esLogin && status === 401) return "Correo o contraseña incorrectos.";
  if (status === 429) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
  if (status === 403) return "No tienes permiso para realizar esta acción.";
  if (status === 404) return "No se encontró el recurso solicitado.";

  if (Array.isArray(body?.errors)) return body.errors.map((e) => traducir(String(e))).join(" ");
  if (body?.errors && typeof body.errors === "object") return "Revisa los datos ingresados.";

  const texto = body?.title ?? body?.message;
  if (texto) return traducir(texto);
  return `Error ${status}`;
}
