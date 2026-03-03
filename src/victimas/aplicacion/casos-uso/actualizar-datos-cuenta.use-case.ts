import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ActualizarDatosCuenta, VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class ActualizarDatosCuentaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, datos: ActualizarDatosCuenta): Promise<void> {
    const victimaExistente = await this.victimaRepositorio.obtenerVictimaConDispositivo(idVictima);

    if (!victimaExistente) {
      throw new NotFoundException('Víctima no encontrada');
    }

    await this.victimaRepositorio.actualizarDatosCuenta(idVictima, datos);
  }
}
