import { Inject, Injectable } from '@nestjs/common';

import { TipoDestinatario } from '../../dominio/entidades/notificacion.entity';
import { NotificacionRepositorioPort } from '../../dominio/puertos/notificacion.port';
import { NOTIFICACION_REPOSITORIO_TOKEN } from '../../dominio/tokens/notificacion.tokens';

export interface NotificacionMultiple {
  fcmToken: string;
  titulo: string;
  cuerpo: string;
  datos?: Record<string, string>;
}

export interface EnviarNotificacionesMultiplesInput {
  notificaciones: NotificacionMultiple[];
  tipoDestinatario: TipoDestinatario;
}

@Injectable()
export class EnviarNotificacionesMultiplesUseCase {
  constructor(
    @Inject(NOTIFICACION_REPOSITORIO_TOKEN)
    private readonly notificacionRepositorio: NotificacionRepositorioPort,
  ) {}

  async ejecutar(input: EnviarNotificacionesMultiplesInput): Promise<void> {
    if (input.tipoDestinatario === TipoDestinatario.USUARIO_WEB) {
      await this.notificacionRepositorio.enviarNotificacionesMultiplesFirebase(input.notificaciones);
    } else {
      await this.notificacionRepositorio.enviarNotificacionesMultiplesExpo(input.notificaciones);
    }
  }
}
