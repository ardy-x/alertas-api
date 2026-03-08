import { Inject, Injectable } from '@nestjs/common';
import { PersonalPort } from '@/integraciones/dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '@/integraciones/dominio/tokens/integracion.tokens';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { INVESTIGADOR_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

export interface InvestigadorHistorial {
  id: string;
  ciInvestigador: string;
  fechaAsignacion: Date;
  activo: boolean;
  observaciones: string | null;
  // Datos del funcionario desde Personal
  nombreCompleto: string;
  grado: string;
  unidad: string;
  cargo: string;
  nroEscalafon: string;
}

@Injectable()
export class ListarHistorialInvestigadoresUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    @Inject(PERSONAL_TOKEN)
    private readonly personalPort: PersonalPort,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorHistorial[]> {
    // Obtener historial de investigadores
    const investigadores = await this.investigadorRepositorio.obtenerHistorial(idVictima);

    // Obtener datos de cada investigador desde Personal
    const historialConDatos = await Promise.all(
      investigadores.map(async (inv) => {
        try {
          const funcionarios = await this.personalPort.buscarFuncionario(inv.ciInvestigador);
          const funcionario = funcionarios?.[0];

          return {
            id: inv.id,
            ciInvestigador: inv.ciInvestigador,
            fechaAsignacion: inv.fechaAsignacion,
            activo: inv.activo,
            observaciones: inv.observaciones,
            nombreCompleto: funcionario?.nombreCompleto || 'No disponible',
            grado: funcionario?.grado || 'No disponible',
            unidad: funcionario?.unidad || 'No disponible',
            cargo: funcionario?.cargo || 'No disponible',
            nroEscalafon: funcionario?.nroEscalafon || 'No disponible',
          };
        } catch {
          // Si falla la búsqueda del funcionario, retornar con datos por defecto
          return {
            id: inv.id,
            ciInvestigador: inv.ciInvestigador,
            fechaAsignacion: inv.fechaAsignacion,
            activo: inv.activo,
            observaciones: inv.observaciones,
            nombreCompleto: 'No disponible',
            grado: 'No disponible',
            unidad: 'No disponible',
            cargo: 'No disponible',
            nroEscalafon: 'No disponible',
          };
        }
      }),
    );

    return historialConDatos;
  }
}
