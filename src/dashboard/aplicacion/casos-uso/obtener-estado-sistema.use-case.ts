import { Inject, Injectable } from '@nestjs/common';

import { EstadoSistema } from '../../dominio/entidades/estado-sistema.entity';
import type { MonitorSistemaPuerto } from '../../dominio/puertos/monitor-sistema.puerto';
import { MONITOR_SISTEMA_TOKEN } from '../../dominio/tokens/dashboard.tokens';

@Injectable()
export class ObtenerEstadoSistemaUseCase {
  constructor(
    @Inject(MONITOR_SISTEMA_TOKEN)
    private readonly monitorSistema: MonitorSistemaPuerto,
  ) {}

  async ejecutar(): Promise<EstadoSistema> {
    const procesosPM2 = ['alertas-api'];

    const [estadoProcesos, estadoBaseDatos, recursosHardware, estadoWebSocket, serviciosExternos] = await Promise.all([
      this.monitorSistema.obtenerEstadoProcesosPM2(procesosPM2),
      this.monitorSistema.verificarConexionBaseDatos(),
      this.monitorSistema.obtenerRecursosHardware(),
      this.monitorSistema.obtenerEstadoConexionesWebSocket(),
      this.monitorSistema.verificarServiciosExternos(),
    ]);

    return new EstadoSistema(estadoProcesos, estadoBaseDatos, recursosHardware, estadoWebSocket, serviciosExternos);
  }
}
