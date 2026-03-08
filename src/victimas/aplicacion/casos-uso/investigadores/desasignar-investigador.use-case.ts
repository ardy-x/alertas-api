import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class DesasignarInvestigadorUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string): Promise<void> {
    // Verificar que la víctima existe
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Verificar que existe un investigador activo
    const investigadorActivo = await this.investigadorRepositorio.obtenerActivo(idVictima);
    if (!investigadorActivo) {
      throw new NotFoundException('No hay investigador asignado a esta víctima');
    }

    // Desasignar investigador
    await this.investigadorRepositorio.desasignar(idVictima);
  }
}
