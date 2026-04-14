/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';
import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoEvento } from '@/alertas/dominio/enums/evento-enums';

import { CrearAlertaUseCase } from './crear-alerta.use-case';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'alerta-id-fijo'),
}));

describe('Creación de alerta con estado PENDIENTE', () => {
  it('crea la alerta en estado PENDIENTE y notifica a operadores', async () => {
    const fechaReciente = new Date().toISOString();
    // Arrange: simular repositorios, validaciones y notificación externa.
    const alertaRepositorio = {
      obtenerDatosVictimaParaAlerta: jest.fn().mockResolvedValue({
        idMunicipio: null,
        nombreCompleto: 'Victima Demo',
      }),
      crearAlerta: jest.fn().mockResolvedValue({
        id: 'alerta-id-fijo',
        estadoAlerta: EstadoAlerta.PENDIENTE,
      }),
    };

    const eventoDominioService = {
      registrarEventoAutomatico: jest.fn().mockResolvedValue(undefined),
    };

    const obtenerProvinciaDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue(null),
    };

    const encontrarDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue({
        municipio: { id: 101 },
        departamento: { id: 10 },
      }),
    };

    const validarVictimaService = {
      validarVictimaExiste: jest.fn().mockResolvedValue(undefined),
      validarVictimaSinAlertaActiva: jest.fn().mockResolvedValue(undefined),
    };

    const notificarCreacionAlertaUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CrearAlertaUseCase(
      alertaRepositorio as never,
      eventoDominioService as never,
      obtenerProvinciaDepartamentoUseCase as never,
      encontrarDepartamentoUseCase as never,
      validarVictimaService as never,
      notificarCreacionAlertaUseCase as never,
    );

    // Act: ejecutar la creación de alerta con datos mínimos válidos.
    const resultado = await useCase.ejecutar({
      idVictima: '7d0d7a79-3ae0-4bd6-9d7e-d8e6adfcb7d1',
      fechaHora: fechaReciente,
      codigoDenuncia: 'DEN-001',
      ubicacion: {
        latitud: -16.5,
        longitud: -68.15,
        precision: 10,
        marcaTiempo: fechaReciente,
      },
    });

    // Assert: confirmar persistencia, evento de dominio y notificación emitida.
    expect(alertaRepositorio.crearAlerta).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'alerta-id-fijo',
        idVictima: '7d0d7a79-3ae0-4bd6-9d7e-d8e6adfcb7d1',
        estadoAlerta: EstadoAlerta.PENDIENTE,
        origen: OrigenAlerta.FELCV,
        idMunicipio: 101,
      }),
    );

    expect(eventoDominioService.registrarEventoAutomatico).toHaveBeenCalledWith('alerta-id-fijo', TipoEvento.ALERTA_RECIBIDA, expect.any(Object));

    expect(notificarCreacionAlertaUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        idAlerta: 'alerta-id-fijo',
        estado: EstadoAlerta.PENDIENTE,
        idDepartamento: 10,
      }),
    );

    expect(resultado).toEqual({
      alerta: {
        id: 'alerta-id-fijo',
        estadoAlerta: EstadoAlerta.PENDIENTE,
      },
    });
  });

  it('usa municipio de la victima cuando no hay ubicacion y deriva departamento', async () => {
    const fechaReciente = new Date().toISOString();
    const alertaRepositorio = {
      obtenerDatosVictimaParaAlerta: jest.fn().mockResolvedValue({
        idMunicipio: 101,
        nombreCompleto: 'Victima Demo',
      }),
      crearAlerta: jest.fn().mockResolvedValue({
        id: 'alerta-id-fijo',
        estadoAlerta: EstadoAlerta.PENDIENTE,
      }),
    };
    const eventoDominioService = {
      registrarEventoAutomatico: jest.fn().mockResolvedValue(undefined),
    };
    const obtenerProvinciaDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue({
        departamento: { id: 9, departamento: 'Tarija' },
      }),
    };
    const encontrarDepartamentoUseCase = {
      ejecutar: jest.fn(),
    };
    const validarVictimaService = {
      validarVictimaExiste: jest.fn().mockResolvedValue(undefined),
      validarVictimaSinAlertaActiva: jest.fn().mockResolvedValue(undefined),
    };
    const notificarCreacionAlertaUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new CrearAlertaUseCase(
      alertaRepositorio as never,
      eventoDominioService as never,
      obtenerProvinciaDepartamentoUseCase as never,
      encontrarDepartamentoUseCase as never,
      validarVictimaService as never,
      notificarCreacionAlertaUseCase as never,
    );

    await useCase.ejecutar({
      idVictima: 'victima-1',
      fechaHora: fechaReciente,
      codigoDenuncia: 'DEN-001',
    } as never);

    expect(encontrarDepartamentoUseCase.ejecutar).not.toHaveBeenCalled();
    expect(obtenerProvinciaDepartamentoUseCase.ejecutar).toHaveBeenCalledWith(101);
    expect(notificarCreacionAlertaUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        idDepartamento: 9,
      }),
    );
  });

  it('lanza error cuando no puede determinar departamento', async () => {
    const fechaReciente = new Date().toISOString();
    const alertaRepositorio = {
      obtenerDatosVictimaParaAlerta: jest.fn().mockResolvedValue({
        idMunicipio: null,
        nombreCompleto: 'Victima Demo',
      }),
      crearAlerta: jest.fn(),
    };

    const useCase = new CrearAlertaUseCase(
      alertaRepositorio as never,
      { registrarEventoAutomatico: jest.fn() } as never,
      { ejecutar: jest.fn().mockResolvedValue(null) } as never,
      { ejecutar: jest.fn().mockResolvedValue(null) } as never,
      {
        validarVictimaExiste: jest.fn().mockResolvedValue(undefined),
        validarVictimaSinAlertaActiva: jest.fn().mockResolvedValue(undefined),
      } as never,
      { ejecutar: jest.fn() } as never,
    );

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-2',
        fechaHora: fechaReciente,
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(alertaRepositorio.crearAlerta).not.toHaveBeenCalled();
  });
});
