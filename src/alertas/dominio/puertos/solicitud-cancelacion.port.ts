import {
  CrearSolicitudCancelacionDatos,
  FiltrosSolicitudCancelacion,
  ProcesarSolicitudCancelacionDatos,
  ResultadoBusquedaSolicitudCancelacionBasica,
  SolicitudCancelacionEntity,
} from '../entidades/solicitud-cancelacion.entity';

export interface SolicitudCancelacionRepositorioPort {
  crearSolicitud(datos: CrearSolicitudCancelacionDatos): Promise<void>;
  obtenerSolicitud(id: string): Promise<SolicitudCancelacionEntity | null>;
  procesarSolicitud(id: string, datos: ProcesarSolicitudCancelacionDatos): Promise<void>;
  listarSolicitudes(filtros: FiltrosSolicitudCancelacion): Promise<ResultadoBusquedaSolicitudCancelacionBasica>;
  verificarSolicitudPendiente(idAlerta: string): Promise<boolean>;
  rechazarSolicitudPendientePorAlerta(idAlerta: string): Promise<void>;
}
