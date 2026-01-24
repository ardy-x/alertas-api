export interface CodigoValidacionRepositorioPort {
  crear(codigo: { celular?: string; email?: string; codigo: string }, ttlSegundos: number): Promise<void>;
  validarCodigoPorCelular(celular: string, codigo: string): Promise<boolean>;
  validarCodigoPorEmail(email: string, codigo: string): Promise<boolean>;
  eliminarCodigoPorCelular(celular: string, codigo: string): Promise<void>;
  eliminarCodigoPorEmail(email: string, codigo: string): Promise<void>;
}
