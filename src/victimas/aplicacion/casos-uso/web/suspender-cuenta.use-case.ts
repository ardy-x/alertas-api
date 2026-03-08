import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AlertaVictimaRepositorioPort } from '@/victimas/dominio/puertos/alerta-victima.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { ALERTA_VICTIMA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class SuspenderCuentaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(ALERTA_VICTIMA_REPOSITORIO)
    private readonly alertaVictimaRepositorio: AlertaVictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Suspender cuenta: cambiar estado a SUSPENDIDA y limpiar apiKey
    await this.alertaVictimaRepositorio.suspenderCuenta(idVictima);
  }
}
