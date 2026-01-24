import { Inject, Injectable, Logger } from '@nestjs/common';

import { EnviarNotificacionesMultiplesUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificaciones-multiples.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { NotificarCreacionSolicitudDatos } from '@/notificaciones/dominio/interfaces/notificar-creacion-solicitud.interface';
import { ObtenerTokensFCMUseCase } from '@/usuarios-web/aplicacion/casos-uso/obtener-tokens-fcm.use-case';
import { AlertasGatewayPort } from '@/websockets/dominio/puertos/alertas-gateway.port';
import { ALERTAS_GATEWAY_TOKEN } from '@/websockets/dominio/tokens/websockets.tokens';

@Injectable()
export class NotificarCreacionSolicitudUseCase {
  private readonly logger = new Logger(NotificarCreacionSolicitudUseCase.name);

  constructor(
    @Inject(ALERTAS_GATEWAY_TOKEN)
    private readonly alertasGateway: AlertasGatewayPort,
    private readonly enviarNotificacionesMultiplesUseCase: EnviarNotificacionesMultiplesUseCase,
    private readonly obtenerTokensFCMUseCase: ObtenerTokensFCMUseCase,
  ) {}

  async ejecutar(datos: NotificarCreacionSolicitudDatos): Promise<void> {
    // Notificar vía WebSocket
    this.alertasGateway.notificarCancelacionSolicitud(datos);
    this.logger.log(`Notificación por websocket enviada para solicitud: ${datos.idSolicitud}`);

    // Enviar notificaciones push
    try {
      const tokensFCM = await this.obtenerTokensFCMUseCase.ejecutar(datos.idDepartamento);
      if (tokensFCM.length > 0) {
        const notificaciones = tokensFCM.map((token) => ({
          fcmToken: token,
          titulo: 'Nueva Solicitud de Cancelación',
          cuerpo: `Se ha creado una solicitud de cancelación para ${datos.victima}`,
          datos: { idSolicitud: datos.idSolicitud, idAlerta: datos.idAlerta, tipo: 'solicitud_cancelacion_creada' },
        }));
        await this.enviarNotificacionesMultiplesUseCase.ejecutar({
          notificaciones,
          tipoDestinatario: TipoDestinatario.USUARIO_WEB,
        });
      }
    } catch (error) {
      this.logger.warn('Error al enviar notificaciones push', error);
    }
  }
}
