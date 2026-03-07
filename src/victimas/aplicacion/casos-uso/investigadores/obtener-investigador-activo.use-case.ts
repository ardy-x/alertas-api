import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

export interface InvestigadorActivoConDatos {
  id: string;
  idVictima: string;
  ciInvestigador: string;
  fechaAsignacion: Date;
  observaciones: string | null;
  // Datos del funcionario desde Personal
  nombreCompleto: string;
  grado: string;
  unidad: string;
  cargo: string;
  nroEscalafon: string;
}

@Injectable()
export class ObtenerInvestigadorActivoUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    @Inject(PERSONAL_TOKEN)
    private readonly personalPort: PersonalPort,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorActivoConDatos | null> {
    // Obtener investigador activo
    const investigador = await this.investigadorRepositorio.obtenerActivo(idVictima);

    if (!investigador) {
      return null;
    }

    // Obtener datos del funcionario desde Personal
    const funcionarios = await this.personalPort.buscarFuncionario(investigador.ciInvestigador);

    if (!funcionarios || funcionarios.length === 0) {
      throw new NotFoundException('No se encontraron datos del investigador en el sistema de Personal');
    }

    const funcionario = funcionarios[0];

    return {
      id: investigador.id,
      idVictima: investigador.idVictima,
      ciInvestigador: investigador.ciInvestigador,
      fechaAsignacion: investigador.fechaAsignacion,
      observaciones: investigador.observaciones,
      nombreCompleto: funcionario.nombreCompleto,
      grado: funcionario.grado,
      unidad: funcionario.unidad,
      cargo: funcionario.cargo,
      nroEscalafon: funcionario.nroEscalafon,
    };
  }
}
