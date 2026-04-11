/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';

import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';

import { CrearAlertaUseCase } from './crear-alerta.use-case';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'alerta-id-fijo'),
}));

jest.mock('../../../integraciones/aplicacion/casos-uso/encontrar-departamento.use-case', () => ({
  EncontrarDepartamentoUseCase: jest.fn(),
}));

describe('CrearAlertaUseCase', () => {
  const alertaRepositorio = {
    obtenerDatosVictimaParaAlerta: jest.fn(),
    crearAlerta: jest.fn(),
  };

  const eventoDominioService = {
    registrarEventoAutomatico: jest.fn(),
  };

  const obtenerProvinciaDepartamentoUseCase = {
    ejecutar: jest.fn(),
  };

  const encontrarDepartamentoUseCase = {
    ejecutar: jest.fn(),
  };

  const validarVictimaService = {
    validarVictimaExiste: jest.fn(),
    validarVictimaSinAlertaActiva: jest.fn(),
  };

  const notificarCreacionAlertaUseCase = {
    ejecutar: jest.fn(),
  };

  let useCase: CrearAlertaUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CrearAlertaUseCase(
      alertaRepositorio as never,
      eventoDominioService as never,
      obtenerProvinciaDepartamentoUseCase as never,
      encontrarDepartamentoUseCase as never,
      validarVictimaService as never,
      notificarCreacionAlertaUseCase as never,
    );
  });

  it('crea alerta PENDIENTE, consulta GeoServer por jurisdicción y emite notificación a operadores', async () => {
    const entrada = {
      idVictima: '8ab5b2f6-69b0-4b4f-8274-093faffb0c72',
      fechaHora: new Date().toISOString(),
      codigoDenuncia: 'CUD-001',
      codigoRegistro: 'REG-001',
      ubicacion: {
        latitud: -16.5,
        longitud: -68.15,
      },
    };

    alertaRepositorio.obtenerDatosVictimaParaAlerta.mockResolvedValue({
      nombreCompleto: 'Victima Demo',
      idMunicipio: 101,
    });

    encontrarDepartamentoUseCase.ejecutar.mockResolvedValue({
      municipio: { id: '101' },
      departamento: { id: '2' },
    });

    alertaRepositorio.crearAlerta.mockResolvedValue({
      id: 'alerta-id-fijo',
      estadoAlerta: EstadoAlerta.PENDIENTE,
    });

    const respuesta = await useCase.ejecutar(entrada as never);

    expect(encontrarDepartamentoUseCase.ejecutar).toHaveBeenCalledWith({
      latitud: -16.5,
      longitud: -68.15,
    });

    expect(alertaRepositorio.crearAlerta).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'alerta-id-fijo',
        idVictima: entrada.idVictima,
        estadoAlerta: EstadoAlerta.PENDIENTE,
        origen: OrigenAlerta.FELCV,
        idMunicipio: 101,
      }),
    );

    expect(eventoDominioService.registrarEventoAutomatico).toHaveBeenCalledTimes(1);
    expect(notificarCreacionAlertaUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        idAlerta: 'alerta-id-fijo',
        estado: EstadoAlerta.PENDIENTE,
        idDepartamento: 2,
      }),
    );

    expect(respuesta).toEqual({
      alerta: {
        id: 'alerta-id-fijo',
        estadoAlerta: EstadoAlerta.PENDIENTE,
      },
    });
  });

  it('lanza error si no puede determinar jurisdicción/departamento', async () => {
    const entrada = {
      idVictima: 'f9b348be-e3bb-4493-b25f-c662d447905a',
      fechaHora: new Date().toISOString(),
      ubicacion: {
        latitud: -16.5,
        longitud: -68.15,
      },
    };

    alertaRepositorio.obtenerDatosVictimaParaAlerta.mockResolvedValue({
      nombreCompleto: 'Victima Sin Dpto',
      idMunicipio: null,
    });

    encontrarDepartamentoUseCase.ejecutar.mockResolvedValue(null);

    await expect(useCase.ejecutar(entrada as never)).rejects.toBeInstanceOf(BadRequestException);
    expect(alertaRepositorio.crearAlerta).not.toHaveBeenCalled();
    expect(notificarCreacionAlertaUseCase.ejecutar).not.toHaveBeenCalled();
  });
});
