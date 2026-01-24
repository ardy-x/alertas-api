import { NotificacionRepositorioRequest } from '../entidades/notificacion.entity';

export { NotificacionRepositorioRequest };

export interface NotificacionRepositorioPort {
  enviarNotificacionFirebase(input: NotificacionRepositorioRequest): Promise<void>;
  enviarNotificacionExpo(input: NotificacionRepositorioRequest): Promise<void>;
  enviarNotificacionesMultiplesFirebase(inputs: NotificacionRepositorioRequest[]): Promise<void>;
  enviarNotificacionesMultiplesExpo(inputs: NotificacionRepositorioRequest[]): Promise<void>;
}
