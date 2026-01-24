import { Inject, Injectable, Logger } from '@nestjs/common';

import { EnviarNotificacionesMultiplesUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificaciones-multiples.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { NotificarAlertaCreadaDatos } from '@/notificaciones/dominio/interfaces/notificar-creacion-alerta.interface';
import { ObtenerTokensFCMUseCase } from '@/usuarios-web/aplicacion/casos-uso/obtener-tokens-fcm.use-case';
import { AlertasGatewayPort } from '@/websockets/dominio/puertos/alertas-gateway.port';
import { ALERTAS_GATEWAY_TOKEN } from '@/websockets/dominio/tokens/websockets.tokens';

@Injectable()
export class NotificarCreacionAlertaUseCase {
  private readonly logger = new Logger(NotificarCreacionAlertaUseCase.name);

  constructor(
    @Inject(ALERTAS_GATEWAY_TOKEN)
    private readonly alertasGatewayPort: AlertasGatewayPort,
    private readonly enviarNotificacionesMultiplesUseCase: EnviarNotificacionesMultiplesUseCase,
    private readonly obtenerTokensFCMUseCase: ObtenerTokensFCMUseCase,
  ) {}

  async ejecutar(datos: NotificarAlertaCreadaDatos): Promise<void> {
    // Notificar vía WebSocket
    this.alertasGatewayPort.notificarAlertaCreada(datos);
    this.logger.log(`Notificación por websocket enviada para alerta: ${datos.idAlerta}`);

    // Enviar notificaciones push
    try {
      const tokensFCM = await this.obtenerTokensFCMUseCase.ejecutar(datos.idDepartamento);
      if (tokensFCM.length > 0) {
        const notificaciones = tokensFCM.map((token) => ({
          fcmToken: token,
          titulo: 'Nueva Alerta',
          cuerpo: `Se ha creado una nueva alerta para ${datos.victima}`,
          datos: { idAlerta: datos.idAlerta, tipo: 'alerta_creada' },
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
