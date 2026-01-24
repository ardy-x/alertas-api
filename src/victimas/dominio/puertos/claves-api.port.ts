export interface ClavesApiPort {
  obtenerPorClave(claveApi: string): Promise<{ cedulaIdentidad: string; estadoCuenta: string } | null>;
}
