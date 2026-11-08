// Traduce los mensajes del backend (en inglés) a mensajes para el usuario
const TRADUCCIONES: [RegExp, string][] = [
  [/device with this serial number already exists/i, "Ya existe un nodo con ese número de serie."],
  [/device with recorded sensor readings( or risks)? cannot be deleted/i, "No se puede eliminar un nodo con lecturas o riesgos registrados."],
  [/device with components or queued test commands cannot be deleted/i, "No se puede eliminar un nodo con componentes; elimina primero sus componentes."],
  [/component is already registered on the device/i, "Ese componente ya está registrado en el nodo."],
  [/component with recorded readings, actions, or tests cannot be deleted/i, "No se puede eliminar un componente con historial; márcalo como deshabilitado."],
  [/device must be online to queue a component test/i, "El nodo debe estar en línea para probar un componente."],
  [/only actuator components can be tested/i, "Solo se pueden probar los actuadores."],
  [/cannot disable their own account/i, "Un administrador no puede desactivar su propia cuenta."],
  [/cannot delete their own account/i, "Un administrador no puede eliminar su propia cuenta."],
  [/last administrator account cannot be deleted/i, "No se puede eliminar al último administrador."],
  [/at most three administrator accounts/i, "Ya existen 3 administradores; no se pueden crear más."],
  [/user with property assignments cannot be deleted/i, "Este usuario tiene asignaciones; quítalas o desactívalo."],
  [/user who registered devices cannot be deleted/i, "Este usuario registró nodos; desactívalo en lugar de eliminarlo."],
  [/notification records cannot be deleted/i, "Este usuario tiene notificaciones; desactívalo en lugar de eliminarlo."],
  [/risk referenced by an emergency response cannot be deleted/i, "No se puede eliminar un riesgo con una respuesta de emergencia."],
  [/property with zones or user assignments cannot be deleted/i, "No se puede eliminar un inmueble con zonas o usuarios asignados."],
  [/zone with this name already exists/i, "Ya existe una zona con ese nombre en el inmueble."],
  [/zone with assigned devices or users cannot be deleted/i, "No se puede eliminar una zona con nodos o usuarios asignados."],
  [/zoneid does not identify a registered zone/i, "La zona seleccionada no existe."],
  [/resident assignments must include a zoneid/i, "Las asignaciones de un residente deben incluir una zona."],
  [/does not belong to propertyid/i, "La zona no pertenece al inmueble seleccionado."],
  [/propertyid .* does not exist/i, "El inmueble seleccionado no existe."],
  [/password change required/i, "Debes cambiar tu contraseña para continuar."],
  [/already taken/i, "Ya existe un usuario con ese correo."],
  [/incorrect password/i, "La contraseña actual es incorrecta."],
  [/passwords must be at least/i, "La contraseña debe tener al menos 12 caracteres."],
  [/non alphanumeric/i, "La contraseña debe incluir un símbolo."],
  [/passwords must have at least one digit/i, "La contraseña debe incluir un número."],
  [/passwords must have at least one uppercase/i, "La contraseña debe incluir una mayúscula."],
  [/passwords must have at least one lowercase/i, "La contraseña debe incluir una minúscula."],
  [/timezone must be a valid/i, "La zona horaria no es válida."],
  [/date range cannot exceed/i, "El rango de fechas no puede superar 366 días."],
  [/from must be earlier than to/i, "La fecha inicial debe ser anterior a la final."],
];

function traducir(texto: string): string {
  return TRADUCCIONES.find(([patron]) => patron.test(texto))?.[1] ?? texto;
}

type CuerpoError = { errors?: unknown; title?: string; message?: string } | null;

export function mensajeDeError(status: number, body: CuerpoError, esLogin: boolean): string {
  if (esLogin && status === 401) return "Correo o contraseña incorrectos.";
  if (status === 429) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
  if (status === 403) return body?.title ? traducir(body.title) : "No tienes permiso para realizar esta acción.";
  if (status === 404) return "No se encontró el recurso solicitado.";

  if (Array.isArray(body?.errors)) return body.errors.map((e) => traducir(String(e))).join(" ");
  if (body?.errors && typeof body.errors === "object") return "Revisa los datos ingresados.";

  const texto = body?.title ?? body?.message;
  if (texto) return traducir(texto);
  return `Error ${status}`;
}
