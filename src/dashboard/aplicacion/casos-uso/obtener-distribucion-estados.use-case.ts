import { Inject, Injectable } from '@nestjs/common';

import { DistribucionEstados, EstadoAlertaDistribucion } from '@/dashboard/dominio/entidades/distribucion-estados.entity';
import { DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';

@Injectable()
export class ObtenerDistribucionEstadosUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
  ) {}

  async ejecutar(): Promise<DistribucionEstados> {
    const estadosCrudos = await this.dashboardRepositorio.obtenerDistribucionEstados();

    // Calcular total
    const totalAlertas = estadosCrudos.reduce((sum, item) => sum + item.cantidad, 0);

    // Mapear estados con nombres legibles y porcentajes
    const estadosNombres: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      ASIGNADA: 'Asignada',
      EN_ATENCION: 'En Atención',
      RESUELTA: 'Resuelta',
      CANCELADA: 'Cancelada',
      FALSA_ALERTA: 'Falsa Alerta',
    };

    const estadosProcesados: EstadoAlertaDistribucion[] = estadosCrudos.map((item) => ({
      estado: estadosNombres[item.estado] || item.estado,
      cantidad: item.cantidad,
      porcentaje: totalAlertas > 0 ? parseFloat(((item.cantidad / totalAlertas) * 100).toFixed(2)) : 0,
    }));

    // Ordenar por cantidad descendente
    estadosProcesados.sort((a, b) => b.cantidad - a.cantidad);

    return new DistribucionEstados(estadosProcesados, totalAlertas);
  }
}
