/// <reference types="jest" />

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AsignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/asignar-investigador.use-case';

describe('Asignación de investigador a víctima', () => {
  it('asigna investigador cuando la víctima existe y no tiene el mismo investigador activo', async () => {
    // Arrange: simular víctima existente y repositorio de asignación.
    const investigadorRepositorio = {
      obtenerActivo: jest.fn().mockResolvedValue(null),
      asignar: jest.fn().mockResolvedValue(undefined),
    };
    const victimaRepositorio = {
      obtenerVictimaSimple: jest.fn().mockResolvedValue({ id: 'victima-1' }),
    };

    const useCase = new AsignarInvestigadorUseCase(investigadorRepositorio as never, victimaRepositorio as never);

    // Act: ejecutar asignación del investigador.
    await useCase.ejecutar('victima-1', 'investigador-1', 'admin-1', 'Asignación inicial');

    // Assert: confirmar datos de asignación persistidos.
    expect(investigadorRepositorio.asignar).toHaveBeenCalledWith(
      expect.objectContaining({
        idVictima: 'victima-1',
        idUsuarioInvestigador: 'investigador-1',
        idUsuarioAsignador: 'admin-1',
        observaciones: 'Asignación inicial',
      }),
    );
  });

  it('lanza NotFoundException cuando la victima no existe', async () => {
    const useCase = new AsignarInvestigadorUseCase(
      {
        obtenerActivo: jest.fn(),
        asignar: jest.fn(),
      } as never,
      {
        obtenerVictimaSimple: jest.fn().mockResolvedValue(null),
      } as never,
    );

    await expect(useCase.ejecutar('victima-404', 'investigador-1', 'admin-1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza BadRequestException cuando el investigador ya esta asignado', async () => {
    const investigadorRepositorio = {
      obtenerActivo: jest.fn().mockResolvedValue({ idUsuarioInvestigador: 'investigador-1' }),
      asignar: jest.fn(),
    };
    const victimaRepositorio = {
      obtenerVictimaSimple: jest.fn().mockResolvedValue({ id: 'victima-1' }),
    };

    const useCase = new AsignarInvestigadorUseCase(investigadorRepositorio as never, victimaRepositorio as never);

    await expect(useCase.ejecutar('victima-1', 'investigador-1', 'admin-1')).rejects.toBeInstanceOf(BadRequestException);
    expect(investigadorRepositorio.asignar).not.toHaveBeenCalled();
  });
});
