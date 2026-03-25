import { Inject, Injectable } from '@nestjs/common';
import { ObtenerUsuarioWebUseCase } from '@/usuarios-web/aplicacion/casos-uso/obtener-usuario-web.use-case';
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
  rol: string;
  unidad: string;
}

@Injectable()
export class ObtenerInvestigadorActivoUseCase {
  constructor(
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    private readonly obtenerUsuarioWeb: ObtenerUsuarioWebUseCase,
  ) {}

  async ejecutar(idVictima: string): Promise<InvestigadorActivoConDatos | null> {
    const investigador = await this.investigadorRepositorio.obtenerActivo(idVictima);

    if (!investigador) {
      return null;
    }

    let datosUsuario = { nombreCompleto: 'Desconocido', grado: '', rol: '', unidad: '' };
    try {
      const usuario = await this.obtenerUsuarioWeb.ejecutar(investigador.idUsuarioInvestigador);
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
      id: investigador.id,
      idVictima: investigador.idVictima,
      idUsuarioInvestigador: investigador.idUsuarioInvestigador,
      fechaAsignacion: investigador.fechaAsignacion,
      observaciones: investigador.observaciones,
      nombreCompleto: datosUsuario.nombreCompleto,
      grado: datosUsuario.grado,
      rol: datosUsuario.rol,
      unidad: datosUsuario.unidad,
    };
  }
}
