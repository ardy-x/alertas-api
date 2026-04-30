import { NotificarAlertaCreadaDatos, NotificarCancelacionSolicitudDatos, NotificarLlegadaConfirmadaDatos, NotificarPuntoRutaAgregadoDatos } from '../entidades/websockets.entity';

export { NotificarAlertaCreadaDatos, NotificarCancelacionSolicitudDatos, NotificarPuntoRutaAgregadoDatos, NotificarLlegadaConfirmadaDatos };

export interface AlertasGatewayPort {
  notificarAlertaCreada(datos: NotificarAlertaCreadaDatos): void;
  notificarCancelacionSolicitud(datos: NotificarCancelacionSolicitudDatos): void;
  notificarPuntoRutaAgregado(datos: NotificarPuntoRutaAgregadoDatos): void;
  notificarLlegadaConfirmada(datos: NotificarLlegadaConfirmadaDatos): void;
}
