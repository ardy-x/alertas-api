/// <reference types="jest" />

import { EncontrarDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/encontrar-departamento.use-case';

describe('Resolución de jurisdicción por GPS mediante GeoServer', () => {
  it('consulta GeoServer y retorna municipio/departamento', async () => {
    // Arrange: simular puerto GeoServer.
    const geoServerPort = {
      encontrarDepartamento: jest.fn().mockResolvedValue({
        municipio: { id: 201, municipio: 'Centro' },
        provincia: { id: 21, provincia: 'Murillo' },
        departamento: { id: 2, departamento: 'La Paz' },
      }),
    };

    const useCase = new EncontrarDepartamentoUseCase(geoServerPort as never);

    // Act: resolver jurisdiccion por coordenadas.
    const resultado = await useCase.ejecutar({ latitud: -16.5, longitud: -68.15 });

    // Assert: validar llamado al puerto y salida esperada.
    expect(geoServerPort.encontrarDepartamento).toHaveBeenCalledWith({
      ubicacion: {
        latitud: -16.5,
        longitud: -68.15,
      },
    });
    expect(resultado.departamento.departamento).toBe('La Paz');
  });
});
