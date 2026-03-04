import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { ALERTA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

@Injectable()
export class ObtenerEstadoAlertaUseCase {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
  ) {}

  async ejecutar(idAlerta: string): Promise<{ estadoAlerta: string }> {
    const estadoAlerta = await this.alertaRepositorio.obtenerEstadoAlerta(idAlerta);

    if (!estadoAlerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    return { estadoAlerta };
  }
}
