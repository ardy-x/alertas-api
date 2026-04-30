import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { AtencionRepositorioPort } from '@/alertas/dominio/puertos/atencion.port';
import { AtencionPersonalPort } from '@/alertas/dominio/puertos/atencion-funcionario.port';
import { ALERTA_REPOSITORIO_TOKEN, ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN, ATENCION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { AlertasGatewayPort } from '@/websockets/dominio/puertos/alertas-gateway.port';
import { ALERTAS_GATEWAY_TOKEN } from '@/websockets/dominio/tokens/websockets.tokens';

@Injectable()
export class ConfirmarLlegadaFuncionarioUseCase {
  constructor(
    @Inject(ATENCION_REPOSITORIO_TOKEN)
    private readonly atencionRepo: AtencionRepositorioPort,
    @Inject(ATENCION_FUNCIONARIO_REPOSITORIO_TOKEN)
    private readonly atencionFuncionarioRepo: AtencionPersonalPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
    @Inject(ALERTAS_GATEWAY_TOKEN)
    private readonly alertasGateway: AlertasGatewayPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(idAlerta: string, ciFuncionario: string): Promise<void> {
    const atencion = await this.atencionRepo.obtenerPorAlerta(idAlerta);
    if (!atencion) {
      throw new NotFoundException('Atención no encontrada');
    }

    // verificar que el funcionario exista
    const funcionarios = await this.atencionFuncionarioRepo.obtenerPorAtencion(atencion.id);
    const funcion = funcionarios.find((f) => f.ciFuncionario === ciFuncionario);
    if (!funcion) {
      throw new NotFoundException('Personal policial no encontrado');
    }
    if (funcion.confirmacionVictima) {
      throw new ConflictException('Llegada ya confirmada por la víctima');
    }

    // marcar confirmación de la víctima
    await this.atencionFuncionarioRepo.confirmarLlegadaVictima(atencion.id, ciFuncionario);

    // obtener departamento para notificar por websocket a la sala de operadores
    const alerta = await this.alertaRepositorio.obtenerAlertaSimple(idAlerta);
    if (alerta?.idMunicipio) {
      const datosGeo = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);
      if (datosGeo) {
        this.alertasGateway.notificarLlegadaConfirmada({
          idAlerta,
          ciFuncionario,
          idDepartamento: Number(datosGeo.departamento.id),
        });
      }
    }
  }
}
