/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common';
import { DesasignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/desasignar-investigador.use-case';

describe('Desasignación de investigador anterior', () => {
  it('desasigna al investigador activo de la víctima', async () => {
    // Arrange: preparar víctima e investigador activo simulado.
    const investigadorRepositorio = {
      obtenerActivo: jest.fn().mockResolvedValue({ idUsuarioInvestigador: 'investigador-1' }),
      desasignar: jest.fn().mockResolvedValue(undefined),
    };
    const victimaRepositorio = {
      obtenerVictimaSimple: jest.fn().mockResolvedValue({ id: 'victima-1' }),
    };

    const useCase = new DesasignarInvestigadorUseCase(investigadorRepositorio as never, victimaRepositorio as never);

    // Act: ejecutar la desasignación.
    await useCase.ejecutar('victima-1');

    // Assert: validar que se eliminó la asignación activa.
    expect(investigadorRepositorio.desasignar).toHaveBeenCalledWith('victima-1');
  });

  it('lanza NotFoundException cuando la victima no existe', async () => {
    const useCase = new DesasignarInvestigadorUseCase(
      {
        obtenerActivo: jest.fn(),
        desasignar: jest.fn(),
      } as never,
      {
        obtenerVictimaSimple: jest.fn().mockResolvedValue(null),
      } as never,
    );

    await expect(useCase.ejecutar('victima-404')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza NotFoundException cuando no hay investigador activo', async () => {
    const investigadorRepositorio = {
      obtenerActivo: jest.fn().mockResolvedValue(null),
      desasignar: jest.fn(),
    };
    const victimaRepositorio = {
      obtenerVictimaSimple: jest.fn().mockResolvedValue({ id: 'victima-1' }),
    };

    const useCase = new DesasignarInvestigadorUseCase(investigadorRepositorio as never, victimaRepositorio as never);

    await expect(useCase.ejecutar('victima-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(investigadorRepositorio.desasignar).not.toHaveBeenCalled();
  });
});
