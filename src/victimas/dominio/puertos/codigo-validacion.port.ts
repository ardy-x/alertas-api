export interface CodigoValidacionRepositorioPort {
  crear(codigo: { celular?: string; email?: string; codigo: string }, ttlSegundos: number): Promise<void>;
  validarCodigoPorCelular(celular: string, codigo: string): Promise<boolean>;
  validarCodigoPorEmail(email: string, codigo: string): Promise<boolean>;
  eliminarCodigoPorCelular(celular: string, codigo?: string): Promise<void>;
  eliminarCodigoPorEmail(email: string, codigo?: string): Promise<void>;
  obtenerIntentosPorCelular(celular: string, fecha: string): Promise<number>;
  obtenerIntentosPorEmail(email: string, fecha: string): Promise<number>;
  incrementarIntentosPorCelular(celular: string, fecha: string, ttlSegundos: number): Promise<number>;
  incrementarIntentosPorEmail(email: string, fecha: string, ttlSegundos: number): Promise<number>;
}
