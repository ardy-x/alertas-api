import { Inject, Injectable } from '@nestjs/common';

import { DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { MetricasDashboardService } from '@/dashboard/dominio/servicios/metricas-dashboard.service';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';

@Injectable()
export class ObtenerMetricasTiempoUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
    private readonly metricasDashboardService: MetricasDashboardService,
  ) {}

  async ejecutar() {
    // Obtener datos crudos del adaptador
    const datosCrudos = await this.dashboardRepositorio.obtenerMetricasTiempo();

    // Calcular métricas con el servicio de dominio
    return this.metricasDashboardService.calcularMetricasTiempo(datosCrudos);
  }
}
