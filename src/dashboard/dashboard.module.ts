import { Module } from '@nestjs/common';

import { IntegracionesModule } from '@/integraciones/integraciones.module';
import { PrismaModule } from '@/prisma/prisma.module';

import { ObtenerAlertasPorUbicacionUseCase } from './aplicacion/casos-uso/obtener-alertas-por-ubicacion.use-case';
import { ObtenerAlertasRecientesUseCase } from './aplicacion/casos-uso/obtener-alertas-recientes.use-case';
import { ObtenerMetricasGeneralesUseCase } from './aplicacion/casos-uso/obtener-metricas-generales.use-case';
import { ObtenerMetricasTiempoUseCase } from './aplicacion/casos-uso/obtener-metricas-tiempo.use-case';
import { MetricasDashboardService } from './dominio/servicios/metricas-dashboard.service';
import { DASHBOARD_REPOSITORIO_TOKEN } from './dominio/tokens/dashboard.tokens';
import { DashboardPrismaAdapter } from './infraestructura/adaptadores/dashboard-prisma.adapter';
import { DashboardController } from './presentacion/controladores/dashboard.controller';

@Module({
  imports: [PrismaModule, IntegracionesModule],
  controllers: [DashboardController],
  providers: [
    // Casos de uso
    ObtenerMetricasGeneralesUseCase,
    ObtenerAlertasPorUbicacionUseCase,
    ObtenerAlertasRecientesUseCase,
    ObtenerMetricasTiempoUseCase,

    // Servicios de Dominio
    MetricasDashboardService,

    // Adaptadores
    DashboardPrismaAdapter,

    // Inyección de dependencias
    {
      provide: DASHBOARD_REPOSITORIO_TOKEN,
      useClass: DashboardPrismaAdapter,
    },
  ],
  exports: [ObtenerMetricasGeneralesUseCase, ObtenerAlertasPorUbicacionUseCase, ObtenerAlertasRecientesUseCase, ObtenerMetricasTiempoUseCase],
})
export class DashboardModule {}
