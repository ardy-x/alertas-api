import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EnviarNotificacionUseCase } from '@/notificaciones/aplicacion/casos-uso/enviar-notificacion.use-case';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { AlertaVictimaRepositorioPort } from '@/victimas/dominio/puertos/alerta-victima.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { ALERTA_VICTIMA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class SuspenderCuentaUseCase {
  private readonly logger = new Logger(SuspenderCuentaUseCase.name);

  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(ALERTA_VICTIMA_REPOSITORIO)
    private readonly alertaVictimaRepositorio: AlertaVictimaRepositorioPort,
    private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase,
  ) {}

  async ejecutar(idVictima: string): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaConDispositivo(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Suspender cuenta: cambiar estado a SUSPENDIDA y limpiar apiKey
    await this.alertaVictimaRepositorio.suspenderCuenta(idVictima);

    // Enviar notificación push de suspensión de cuenta si tiene token
    try {
      const fcmToken = victima.fcmToken?.trim();
      if (fcmToken) {
        await this.enviarNotificacionUseCase.ejecutar({
          fcmToken,
          titulo: 'Cuenta suspendida',
          cuerpo: 'Tu cuenta ha sido suspendida. Ponte en contacto con soporte para más información.',
          datos: {
            tipo: 'cuenta_suspendida',
            idVictima: idVictima,
          },
          tipoDestinatario: TipoDestinatario.VICTIMA,
        });
      }
    } catch (error) {
      this.logger.warn(`No se pudo enviar notificación de suspensión de cuenta para victima ${idVictima}:`, error);
      // No interrumpir el proceso de suspensión por fallo en notificación.
    }
  }
}
