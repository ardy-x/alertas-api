import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';

export interface NotificarCreacionSolicitudDatos {
  idSolicitud: string;
  idAlerta: string;
  estado: EstadoSolicitudCancelacion;
  fechaHora: string;
  victima: string;
  idDepartamento: number;
}
