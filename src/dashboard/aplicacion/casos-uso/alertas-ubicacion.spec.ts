/// <reference types="jest" />

import { ObtenerAlertasPorUbicacionUseCase } from './obtener-alertas-por-ubicacion.use-case';

describe('Consulta de distribución geográfica de alertas', () => {
  it('agrupa alertas por departamento y conserva departamentos sin alertas con valor 0', async () => {
    // Arrange: simular entradas geograficas y estadisticas por municipio.
    const dashboardRepositorio = {
      obtenerAlertasPorMunicipio: jest.fn().mockResolvedValue([{ idMunicipio: 101, totalAlertas: 3, alertasActivas: 2, alertasCerradas: 1 }]),
    };

    const obtenerDepartamentosUseCase = {
      ejecutar: jest.fn().mockResolvedValue([
        { id: 2, departamento: 'La Paz' },
        { id: 3, departamento: 'Cochabamba' },
      ]),
    };

    const obtenerProvinciaDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue({
        departamento: { id: 2, departamento: 'La Paz' },
      }),
    };

    const useCase = new ObtenerAlertasPorUbicacionUseCase(dashboardRepositorio as never, obtenerDepartamentosUseCase as never, obtenerProvinciaDepartamentoUseCase as never);

    // Act: consultar distribucion geografica.
    const resultado = await useCase.ejecutar();

    // Assert: validar agregacion y completitud de departamentos.
    expect(resultado).toEqual([
      { nombreDepartamento: 'La Paz', totalAlertas: 3, alertasActivas: 2, alertasCerradas: 1 },
      { nombreDepartamento: 'Cochabamba', totalAlertas: 0, alertasActivas: 0, alertasCerradas: 0 },
    ]);
  });

  it('acumula alertas en departamento Desconocido cuando no hay mapeo geografico', async () => {
    const dashboardRepositorio = {
      obtenerAlertasPorMunicipio: jest.fn().mockResolvedValue([{ idMunicipio: 999, totalAlertas: 2, alertasActivas: 1, alertasCerradas: 1 }]),
    };
    const obtenerDepartamentosUseCase = {
      ejecutar: jest.fn().mockResolvedValue([
        { id: 1, departamento: 'Desconocido' },
        { id: 2, departamento: 'La Paz' },
      ]),
    };
    const obtenerProvinciaDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue(null),
    };

    const useCase = new ObtenerAlertasPorUbicacionUseCase(dashboardRepositorio as never, obtenerDepartamentosUseCase as never, obtenerProvinciaDepartamentoUseCase as never);

    const resultado = await useCase.ejecutar();

    expect(resultado).toEqual([
      { nombreDepartamento: 'Desconocido', totalAlertas: 2, alertasActivas: 1, alertasCerradas: 1 },
      { nombreDepartamento: 'La Paz', totalAlertas: 0, alertasActivas: 0, alertasCerradas: 0 },
    ]);
  });
});
