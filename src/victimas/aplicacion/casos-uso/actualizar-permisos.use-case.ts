import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActualizarConexion, PermisoApp, VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

@Injectable()
export class ActualizarPermisosUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, permisosApp: PermisoApp): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    const datos: ActualizarConexion = {
      ultimaConexion: new Date(),
      permisosApp,
    };

    await this.victimaRepositorio.actualizarConexion(idVictima, datos);
  }
}
