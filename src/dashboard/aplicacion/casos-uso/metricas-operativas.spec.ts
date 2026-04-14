/// <reference types="jest" />

import { ObtenerMetricasGeneralesUseCase } from './obtener-metricas-generales.use-case';

describe('Cálculo de estadísticas operativas y tiempos de respuesta', () => {
  it('calcula metricas generales a partir de datos crudos del repositorio', async () => {
    // Arrange: simular repositorio de dashboard y servicio de metricas.
    const dashboardRepositorio = {
      obtenerMetricasGenerales: jest.fn().mockResolvedValue({
        alertasActivas: 4,
        alertasPendientes: 2,
        alertasResueltas: 10,
        tiemposAsignacion: [],
        tiemposCierre: [],
        alertasConTiempoRegistro: [],
        tiemposLlegada: [],
      }),
    };

    const metricasDashboardService = {
      calcularMetricasGenerales: jest.fn().mockReturnValue({
        alertasActivas: 4,
        alertasPendientes: 2,
        alertasResueltas: 10,
        promedioAsignacion: { tiempo: '00:00:00.000', descripcion: 'mock' },
        promedioAtencionTotal: { tiempo: '00:00:00.000', descripcion: 'mock' },
        promedioRegistro: { tiempo: '00:00:00.000', descripcion: 'mock' },
        promedioLlegada: { tiempo: '00:00:00.000', descripcion: 'mock' },
      }),
    };

    const useCase = new ObtenerMetricasGeneralesUseCase(dashboardRepositorio as never, metricasDashboardService as never);

    // Act: ejecutar calculo de metricas del dashboard.
    const resultado = await useCase.ejecutar();

    // Assert: validar flujo repositorio -> servicio de dominio.
    expect(dashboardRepositorio.obtenerMetricasGenerales).toHaveBeenCalled();
    expect(metricasDashboardService.calcularMetricasGenerales).toHaveBeenCalled();
    expect(resultado.alertasActivas).toBe(4);
  });
});
