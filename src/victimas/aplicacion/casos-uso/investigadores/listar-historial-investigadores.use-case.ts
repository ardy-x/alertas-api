import { Inject, Injectable } from '@nestjs/common';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

export interface InvestigadorHistorial {
  id: string;
  idUsuarioInvestigador: string;
  fechaAsignacion: Date;
  activo: boolean;
  observaciones: string | null;
  nombreCompleto: string;
  grado: string;
  unidad: string;
}

@Injectable()
export class ListarHistorialInvestigadoresUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorHistorial[]> {
    // Obtener historial de investigadores
    const investigadores = await this.investigadorRepositorio.obtenerHistorial(idVictima);

    // El adapter ya trae datos del usuarioInvestigador (relación en Prisma)
    const historialConDatos = investigadores.map((inv) => ({
      id: inv.id,
      idUsuarioInvestigador: inv.idUsuarioInvestigador,
      fechaAsignacion: inv.fechaAsignacion,
      activo: inv.activo,
      observaciones: inv.observaciones,
      nombreCompleto: inv.nombreCompleto,
      grado: inv.grado,
      unidad: inv.unidad,
    }));

    return historialConDatos;
  }
}
