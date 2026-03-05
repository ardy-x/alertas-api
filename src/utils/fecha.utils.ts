/**
 * Utilidades para manejo de fechas con zona horaria de Bolivia (UTC-4)
 */

const BOLIVIA_UTC_OFFSET = -4; // Bolivia está en UTC-4

/**
 * Convierte una fecha/hora local de Bolivia al inicio del día en UTC
 * Ejemplo: "2026-02-01" en Bolivia → 2026-02-01T04:00:00.000Z (UTC)
 *
 * @param fechaString - Fecha en formato ISO o compatible (YYYY-MM-DD)
 * @returns Date objeto en UTC representando el inicio del día en hora Bolivia
 */
export function convertirFechaBoliviaInicioDelDiaAUTC(fechaString: string): Date {
  // Parsear la fecha como si fuera local de Bolivia (no UTC)
  const fecha = new Date(fechaString);

  // Obtener componentes de la fecha
  const year = fecha.getUTCFullYear();
  const month = fecha.getUTCMonth();
  const day = fecha.getUTCDate();

  // Crear fecha en UTC con el offset de Bolivia
  // Si en Bolivia es 00:00:00, en UTC es 04:00:00 (porque Bolivia = UTC-4)
  const fechaUTC = new Date(Date.UTC(year, month, day, Math.abs(BOLIVIA_UTC_OFFSET), 0, 0, 0));

  return fechaUTC;
}

/**
 * Convierte una fecha/hora local de Bolivia al final del día en UTC
 * Ejemplo: "2026-02-28" en Bolivia → 2026-03-01T03:59:59.999Z (UTC)
 *
 * @param fechaString - Fecha en formato ISO o compatible (YYYY-MM-DD)
 * @returns Date objeto en UTC representando el final del día en hora Bolivia
 */
export function convertirFechaBoliviaFinalDelDiaAUTC(fechaString: string): Date {
  // Parsear la fecha como si fuera local de Bolivia
  const fecha = new Date(fechaString);

  // Obtener componentes de la fecha
  const year = fecha.getUTCFullYear();
  const month = fecha.getUTCMonth();
  const day = fecha.getUTCDate();

  // Crear fecha en UTC con el offset de Bolivia
  // Si en Bolivia es 23:59:59.999, en UTC es al día siguiente 03:59:59.999
  const fechaUTC = new Date(Date.UTC(year, month, day, 23 + Math.abs(BOLIVIA_UTC_OFFSET), 59, 59, 999));

  return fechaUTC;
}

/**
 * Convierte una fecha UTC a hora local de Bolivia
 *
 * @param fechaUTC - Fecha en UTC
 * @returns Date objeto ajustado a hora de Bolivia
 */
export function convertirUTCABolivia(fechaUTC: Date): Date {
  const fechaBolivia = new Date(fechaUTC);
  fechaBolivia.setHours(fechaBolivia.getHours() + BOLIVIA_UTC_OFFSET);
  return fechaBolivia;
}

/**
 * Formatea una fecha UTC para mostrarla en hora de Bolivia
 *
 * @param fechaUTC - Fecha en UTC
 * @param opciones - Opciones de formateo
 * @returns String formateado en hora de Bolivia
 */
export function formatearFechaBolivia(
  fechaUTC: Date | string,
  opciones: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  const fecha = typeof fechaUTC === 'string' ? new Date(fechaUTC) : fechaUTC;
  return fecha.toLocaleString('es-BO', {
    ...opciones,
    timeZone: 'America/La_Paz',
  });
}

/**
 * Formatea una fecha string (YYYY-MM-DD) a formato boliviano (DD/MM/YYYY)
 * Sin conversión de zona horaria, solo formateo
 *
 * @param fechaString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns String en formato DD/MM/YYYY
 */
export function formatearFechaSimple(fechaString: string): string {
  const partes = fechaString.split('T')[0].split('-');
  const [year, month, day] = partes;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Obtiene el mes y año en formato literal desde un string de fecha
 *
 * @param fechaString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns String con mes literal en mayúsculas (ej: "MARZO DE 2026")
 */
export function obtenerMesLiteral(fechaString: string): string {
  const [year, month] = fechaString.split('T')[0].split('-');
  const fecha = new Date(parseInt(year), parseInt(month) - 1, 1);
  const mes = fecha.toLocaleString('es-BO', { month: 'long' }).toUpperCase();
  return `${mes} DE ${year}`;
}

/**
 * Obtiene el rango de meses en formato literal
 *
 * @param fechaDesde - Fecha inicio en formato ISO (YYYY-MM-DD)
 * @param fechaHasta - Fecha fin en formato ISO (YYYY-MM-DD)
 * @returns String con el rango de meses (ej: "MARZO DE 2026" o "FEBRERO DE 2026 - MARZO DE 2026")
 */
export function obtenerRangoMesesLiteral(fechaDesde: string, fechaHasta: string): string {
  const mesDesde = obtenerMesLiteral(fechaDesde);
  const mesHasta = obtenerMesLiteral(fechaHasta);
  return mesDesde === mesHasta ? mesDesde : `${mesDesde} - ${mesHasta}`;
}
