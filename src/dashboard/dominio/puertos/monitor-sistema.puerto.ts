import type { EstadoBaseDatos, EstadoProcesoPM2, EstadoServicioExterno, EstadoWebSocket, RecursosHardware } from '../entidades/estado-sistema.entity';

export interface MonitorSistemaPuerto {
  obtenerEstadoProcesosPM2(nombresProcesos: string[]): Promise<EstadoProcesoPM2[]>;
  verificarConexionBaseDatos(): Promise<EstadoBaseDatos>;
  obtenerRecursosHardware(): Promise<RecursosHardware>;
  obtenerEstadoConexionesWebSocket(): Promise<EstadoWebSocket>;
  verificarServiciosExternos(): Promise<EstadoServicioExterno[]>;
}
