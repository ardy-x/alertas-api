import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { EstadoCuenta } from '@/victimas/dominio/enums/victima-enums';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class CerrarSesionUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string): Promise<void> {
    const victimaExistente = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victimaExistente) {
      throw new NotFoundException('Víctima no encontrada');
    }

    await this.victimaRepositorio.actualizarEstadoCuenta(idVictima, EstadoCuenta.INACTIVA);
  }
}
