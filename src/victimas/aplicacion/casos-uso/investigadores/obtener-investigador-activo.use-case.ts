import { Inject, Injectable } from '@nestjs/common';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

export interface InvestigadorActivoConDatos {
  id: string;
  idVictima: string;
  idUsuarioInvestigador: string;
  fechaAsignacion: Date;
  observaciones: string | null;
  nombreCompleto: string;
  grado: string;
  unidad: string;
}

@Injectable()
export class ObtenerInvestigadorActivoUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorActivoConDatos | null> {
    const investigador = await this.investigadorRepositorio.obtenerActivo(idVictima);

    if (!investigador) {
      return null;
    }

    return {
      id: investigador.id,
      idVictima: investigador.idVictima,
      idUsuarioInvestigador: investigador.idUsuarioInvestigador,
      fechaAsignacion: investigador.fechaAsignacion,
      observaciones: investigador.observaciones,
      nombreCompleto: investigador.nombreCompleto,
      grado: investigador.grado,
      unidad: investigador.unidad,
    };
  }
}
