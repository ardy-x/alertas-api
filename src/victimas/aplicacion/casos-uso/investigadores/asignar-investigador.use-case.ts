import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';
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
    @Inject(PERSONAL_TOKEN)
    private readonly personalPort: PersonalPort,
  ) {}

  async ejecutar(idVictima: string, ciInvestigador: string, idUsuarioAsignador: string, observaciones?: string): Promise<void> {
    // Verificar que la víctima existe
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Verificar si ya existe un investigador activo
    const investigadorActual = await this.investigadorRepositorio.obtenerActivo(idVictima);
    if (investigadorActual && investigadorActual.ciInvestigador === ciInvestigador) {
      throw new BadRequestException('Este investigador ya está asignado a la víctima');
    }

    // Verificar que el investigador existe en el sistema de Personal
    const funcionarios = await this.personalPort.buscarFuncionario(ciInvestigador);
    if (!funcionarios || funcionarios.length === 0) {
      throw new NotFoundException('Investigador no encontrado en el sistema de Personal');
    }

    // Asignar investigador (esto desactiva automáticamente cualquier investigador previo)
    await this.investigadorRepositorio.asignar({
      idVictima,
      ciInvestigador,
      idUsuarioAsignador,
      fechaAsignacion: new Date(),
      observaciones,
    });
  }
}
