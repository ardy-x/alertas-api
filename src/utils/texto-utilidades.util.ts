export class TextoUtilidades {
  /**
   * Formatea un nombre completo capitalizando la primera letra de cada palabra
   */
  static formatearNombreCompleto(texto: string): string {
    if (!texto) return '';
    return texto
      .trim()
      .toLowerCase()
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }

  /**
   * Normaliza para comparación (solo lowercase y sin espacios)
   */
  static normalizarParaComparacion(texto: string): string {
    if (!texto) return '';
    return texto.trim().toLowerCase();
  }
}
