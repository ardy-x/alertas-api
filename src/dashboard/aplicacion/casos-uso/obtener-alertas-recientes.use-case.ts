import { Inject, Injectable } from '@nestjs/common';

import { DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { MetricasDashboardService } from '@/dashboard/dominio/servicios/metricas-dashboard.service';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

@Injectable()
export class ObtenerAlertasRecientesUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly metricasDashboardService: MetricasDashboardService,
  ) {}

  async ejecutar(limite: number = 10) {
    // Obtener datos crudos del adaptador
    const alertasCrudas = await this.dashboardRepositorio.obtenerAlertasRecientes(limite);

    // Procesar con servicio de dominio (calcular tiempo transcurrido)
    const alertasProcesadas = this.metricasDashboardService.procesarAlertasRecientes(alertasCrudas);

    // Enriquecer con datos geográficos
    const alertasEnriquecidas = await Promise.all(
      alertasProcesadas.map(async (alerta) => {
        if (alerta.idMunicipio) {
          const datosGeograficos = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);
          if (datosGeograficos) {
            return {
              ...alerta,
              nombreMunicipio: datosGeograficos.municipio.municipio,
            };
          } else {
            // Si falla obtener datos geográficos, usar valor por defecto
            return {
              ...alerta,
              nombreMunicipio: 'Sin ubicación',
            };
          }
        }

        // Si no tiene idMunicipio
        return {
          ...alerta,
          nombreMunicipio: 'Sin ubicación',
        };
      }),
    );

    return alertasEnriquecidas;
  }
}
