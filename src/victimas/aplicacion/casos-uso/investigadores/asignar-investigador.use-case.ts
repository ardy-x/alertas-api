import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class AsignarInvestigadorUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, idUsuarioInvestigador: string, idUsuarioAsignador: string, observaciones?: string): Promise<void> {
    // Verificar que la víctima existe
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Verificar si ya existe un investigador activo
    const investigadorActual = await this.investigadorRepositorio.obtenerActivo(idVictima);
    if (investigadorActual && investigadorActual.idUsuarioInvestigador === idUsuarioInvestigador) {
      throw new BadRequestException('Este investigador ya está asignado a la víctima');
    }

    // Asignar investigador (esto desactiva automáticamente cualquier investigador previo)
    await this.investigadorRepositorio.asignar({
      idVictima,
      idUsuarioInvestigador,
      idUsuarioAsignador,
      fechaAsignacion: new Date(),
      observaciones,
    });
  }
}
