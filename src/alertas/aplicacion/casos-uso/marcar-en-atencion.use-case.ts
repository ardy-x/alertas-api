import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AlertaEstadoDominioService } from '@/alertas/dominio/servicios/alerta-estado-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ALERTA_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

@Injectable()
export class MarcarEnAtencionUseCase {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
  ) {}

  async ejecutar(idAlerta: string, idUsuarioWeb: string): Promise<void> {
    const estadoActual = await this.alertaRepositorio.obtenerEstadoAlerta(idAlerta);
    if (!estadoActual) {
      throw new NotFoundException('Alerta no encontrada');
    }

    const transicionValida = AlertaEstadoDominioService.validarCambioEstado(estadoActual, EstadoAlerta.EN_ATENCION);
    if (!transicionValida) {
      throw new ConflictException(`No se puede cambiar la alerta a EN_ATENCION desde el estado actual: ${estadoActual}`);
    }

    await this.alertaRepositorio.actualizarEstado(idAlerta, EstadoAlerta.EN_ATENCION);

    await this.eventoDominioService.registrarEventoSemiautomatico(idAlerta, TipoEvento.ATENCION_VICTIMA, idUsuarioWeb);
  }
}
