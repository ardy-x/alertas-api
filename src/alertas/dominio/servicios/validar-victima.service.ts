import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { ALERTA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

@Injectable()
export class ValidarVictimaService {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
  ) {}

  async validarVictimaExiste(idVictima: string): Promise<void> {
    const victima = await this.alertaRepositorio.verificarVictimaExiste(idVictima);
    if (!victima) {
      throw new BadRequestException(`La víctima con ID ${idVictima} no existe en el sistema`);
    }
  }

  async validarVictimaSinAlertaActiva(idVictima: string): Promise<void> {
    const tieneAlertaActiva = await this.alertaRepositorio.verificarAlertaActivaVictima(idVictima);
    if (tieneAlertaActiva) {
      throw new BadRequestException(`Ya tienes una alerta activa en proceso. No puedes enviar una nueva alerta hasta que la anterior sea resuelta.`);
    }
  }
}
