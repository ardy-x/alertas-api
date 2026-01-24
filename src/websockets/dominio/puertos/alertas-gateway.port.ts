import { NotificarAlertaCreadaDatos, NotificarCancelacionSolicitudDatos, NotificarPuntoRutaAgregadoDatos } from '../entidades/websockets.entity';

export { NotificarAlertaCreadaDatos, NotificarCancelacionSolicitudDatos, NotificarPuntoRutaAgregadoDatos };

export interface AlertasGatewayPort {
  notificarAlertaCreada(datos: NotificarAlertaCreadaDatos): void;
  notificarCancelacionSolicitud(datos: NotificarCancelacionSolicitudDatos): void;
  notificarPuntoRutaAgregado(datos: NotificarPuntoRutaAgregadoDatos): void;
}
