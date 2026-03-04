import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';
import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { AlertaEstadoDominioService } from '@/alertas/dominio/servicios/alerta-estado-dominio.service';
import { EventoDominioService } from '@/alertas/dominio/servicios/evento-dominio.service';
import { ALERTA_REPOSITORIO_TOKEN, ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN, EVENTO_DOMINIO_SERVICE_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { NotificarAtencionAlertaUseCase } from './atenciones/notificar-atencion-alerta.use-case';

@Injectable()
export class MarcarEnAtencionUseCase {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepositorio: AtencionRepositorioPort,
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepo: AtencionPersonalPort,
    @Inject(EVENTO_DOMINIO_SERVICE_TOKEN)
    private readonly eventoDominioService: EventoDominioService,
    private readonly notificarAtencionAlertaUseCase: NotificarAtencionAlertaUseCase,
  ) {}

  async ejecutar(idAlerta: string, idUsuarioWeb: string, ciFuncionario: string): Promise<void> {
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(idAlerta);

    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    const transicionValida = AlertaEstadoDominioService.validarCambioEstado(alerta.estadoAlerta, EstadoAlerta.EN_ATENCION);

    if (!transicionValida) {
      throw new ConflictException(`No se puede cambiar la alerta a EN_ATENCION desde el estado actual: ${alerta.estadoAlerta}`);
    }

    await this.alertaRepositorio.actualizarEstado(idAlerta, EstadoAlerta.EN_ATENCION);

    const atencion = await this.atencionRepositorio.obtenerPorAlerta(idAlerta);
    if (!atencion) {
      throw new NotFoundException('Atención no encontrada');
    }

    const funcionarios = await this.atencionFuncionarioRepo.obtenerPorAtencion(atencion.id);
    // marcar solo el especificado
    const func = funcionarios.find((f) => f.ciFuncionario === ciFuncionario);
    if (func && !func.fechaLlegada) {
      await this.atencionFuncionarioRepo.marcarLlegada(atencion.id, ciFuncionario);
    }

    // Notificar a la víctima que el policía tomó contacto
    if (alerta.idVictima) {
      await this.notificarAtencionAlertaUseCase.ejecutar({
        idAlerta,
        idVictima: alerta.idVictima,
        estadoFinal: EstadoAlerta.EN_ATENCION,
      });
    }

    await this.eventoDominioService.registrarEventoSemiautomatico(idAlerta, TipoEvento.ATENCION_VICTIMA, idUsuarioWeb);
  }
}
