import { Inject, Injectable } from '@nestjs/common';
import { ObtenerUsuarioWebUseCase } from '@/usuarios-web/aplicacion/casos-uso/obtener-usuario-web.use-case';
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
  rol: string;
  unidad: string;
}

@Injectable()
export class ListarHistorialInvestigadoresUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    private readonly obtenerUsuarioWeb: ObtenerUsuarioWebUseCase,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorHistorial[]> {
    // Obtener historial de investigadores
    const investigadores = await this.investigadorRepositorio.obtenerHistorial(idVictima);

    const historialConDatos = await Promise.all(
      investigadores.map(async (inv) => {
        let datosUsuario = { nombreCompleto: 'Desconocido', grado: '', rol: '', unidad: '' };
        try {
          const usuario = await this.obtenerUsuarioWeb.ejecutar(inv.idUsuarioInvestigador);
          datosUsuario = {
            nombreCompleto: usuario.nombreCompleto,
            grado: usuario.grado,
            rol: usuario.rol,
            unidad: usuario.unidad,
          };
        } catch {
          // Ignorar si no se encuentra
        }

        return {
          id: inv.id,
          idUsuarioInvestigador: inv.idUsuarioInvestigador,
          fechaAsignacion: inv.fechaAsignacion,
          activo: inv.activo,
          observaciones: inv.observaciones,
          nombreCompleto: datosUsuario.nombreCompleto,
          grado: datosUsuario.grado,
          rol: datosUsuario.rol,
          unidad: datosUsuario.unidad,
        };
      }),
    );

    return historialConDatos;
  }
}
