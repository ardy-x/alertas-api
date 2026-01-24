export interface NotificacionData {
  titulo: string;
  cuerpo: string;
  datos?: Record<string, string>;
}

export enum TipoDestinatario {
  USUARIO_WEB = 'USUARIO_WEB',
  VICTIMA = 'VICTIMA',
}

export interface EnviarNotificacionRequest {
  fcmToken: string;
  titulo: string;
  cuerpo: string;
  datos?: Record<string, string>;
  tipoDestinatario: TipoDestinatario;
}

export interface NotificacionRepositorioRequest {
  fcmToken: string;
  titulo: string;
  cuerpo: string;
  datos?: Record<string, string>;
}
