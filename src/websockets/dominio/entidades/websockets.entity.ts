import { EstadoAlerta, EstadoSolicitudCancelacion, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';

export interface NotificarAlertaCreadaDatos {
  idAlerta: string;
  estado: EstadoAlerta;
  origen: OrigenAlerta;
  fechaHora: string;
  victima: string;
  idDepartamento: number;
}

export interface NotificarCancelacionSolicitudDatos {
  idSolicitud: string;
  idAlerta: string;
  estado: EstadoSolicitudCancelacion;
  fechaHora: string;
  victima: string;
  idDepartamento: number;
}

export interface NotificarPuntoRutaAgregadoDatos {
  idAlerta: string;
  ultimoPunto: {
    latitud: number;
    longitud: number;
  };
  idDepartamento: number;
}
