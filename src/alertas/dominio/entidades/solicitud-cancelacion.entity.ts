import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';

import { EstadoSolicitudCancelacion } from '../enums/alerta-enums';

export interface DatosVictima {
  id: string;
  nombreCompleto: string;
  numeroCelular: string;
  cedulaIdentidad: string;
}

export interface DatosUsuarioWeb {
  id: string;
  nombreCompleto: string;
  grado: string;
}

export interface SolicitudCancelacionEntity {
  id: string;
  idAlerta: string;
  fechaSolicitud: Date;
  estadoSolicitud: EstadoSolicitudCancelacion;
  idUsuarioWeb: string | null;
  motivoCancelacion: string | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  victima: DatosVictima;
  usuarioWeb: DatosUsuarioWeb;
}

export interface CrearSolicitudCancelacionDatos {
  id: string;
  idAlerta: string;
  fechaSolicitud: Date;
  estadoSolicitud: EstadoSolicitudCancelacion;
  idUsuarioWeb: string | null;
  motivoCancelacion: string | null;
  victima?: DatosVictima;
}

export interface SolicitudCancelacionBasica {
  id: string;
  idAlerta: string;
  fechaSolicitud: Date;
  estadoSolicitud: EstadoSolicitudCancelacion;
  victima?: {
    id: string;
    nombreCompleto: string;
    cedulaIdentidad: string;
    celular: string;
    correo?: string;
  };
}

export interface ProcesarSolicitudCancelacionDatos {
  idUsuarioWeb: string;
  estado: EstadoSolicitudCancelacion;
  motivoCancelacion: string;
}

export interface FiltrosSolicitudCancelacion extends PaginacionQuery {
  idAlerta?: string;
  estado?: EstadoSolicitudCancelacion[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  busqueda?: string;
  municipiosIds?: number[];
}

export interface ResultadoBusquedaSolicitudCancelacionBasica {
  solicitudes: SolicitudCancelacionBasica[];
  total: number;
}
