import { Inject, Injectable } from '@nestjs/common';

import { Expo } from 'expo-server-sdk';

import { EnviarNotificacionRequest, NotificacionRepositorioRequest, TipoDestinatario } from '../../dominio/entidades/notificacion.entity';
import { NotificacionRepositorioPort } from '../../dominio/puertos/notificacion.port';
import { NOTIFICACION_REPOSITORIO_TOKEN } from '../../dominio/tokens/notificacion.tokens';

@Injectable()
export class EnviarNotificacionUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORIO_TOKEN)
    private readonly notificacionRepositorio: NotificacionRepositorioPort,
  ) {}

  async ejecutar(input: EnviarNotificacionRequest): Promise<void> {
    // Validar que el token no esté vacío
    if (!input.fcmToken || input.fcmToken.trim().length === 0) {
      throw new Error('Token FCM vacío o nulo');
    }

    const notificacionData: NotificacionRepositorioRequest = {
      fcmToken: input.fcmToken.trim(),
      titulo: input.titulo,
      cuerpo: input.cuerpo,
      datos: input.datos,
    };

    if (input.tipoDestinatario === TipoDestinatario.USUARIO_WEB) {
      return this.notificacionRepositorio.enviarNotificacionFirebase(notificacionData);
    } else {
      if (!Expo.isExpoPushToken(notificacionData.fcmToken)) {
        const tipoStr: string = String(input.tipoDestinatario);
        const tokenStr: string = String(notificacionData.fcmToken);
        throw new Error(`Token Expo inválido para ${tipoStr}: ${tokenStr}`);
      }
      return this.notificacionRepositorio.enviarNotificacionExpo(notificacionData);
    }
  }
}
