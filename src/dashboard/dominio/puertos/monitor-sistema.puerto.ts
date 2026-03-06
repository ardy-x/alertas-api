import type { EstadoBaseDatos, EstadoProcesoPM2, EstadoRedis, EstadoServicioExterno, EstadoWebSocket, RecursosHardware } from '../entidades/estado-sistema.entity';

export interface MonitorSistemaPuerto {
  obtenerEstadoProcesosPM2(nombresProcesos: string[]): Promise<EstadoProcesoPM2[]>;
  verificarConexionBaseDatos(): Promise<EstadoBaseDatos>;
  verificarConexionRedis(): Promise<EstadoRedis>;
  obtenerRecursosHardware(): Promise<RecursosHardware>;
  obtenerEstadoConexionesWebSocket(): Promise<EstadoWebSocket>;
  verificarServiciosExternos(): Promise<EstadoServicioExterno[]>;
}
