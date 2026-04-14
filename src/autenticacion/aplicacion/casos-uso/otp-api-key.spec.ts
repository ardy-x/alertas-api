/// <reference types="jest" />

import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { VerificarCodigoUseCase } from '@/victimas/aplicacion/casos-uso/validacion/verificar-codigo.use-case';
import { EstadoCuenta } from '@/victimas/dominio/enums/victima-enums';
import { CanalSolicitudCodigo } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-request.dto';

jest.mock('@/utils/security.utils', () => ({
  generarApiKey: jest.fn(() => 'api-key-demo'),
  hashString: jest.fn(() => 'api-key-hash-demo'),
}));

describe('Verificación OTP correcta y generación de API Key', () => {
  const crearDependencias = () => {
    const victimaRepositorio = {
      obtenerVictimaConDispositivo: jest.fn(),
      actualizarApiKey: jest.fn().mockResolvedValue(undefined),
    };
    const codigoValidacionRepositorio = {
      validarCodigoPorCelular: jest.fn(),
      eliminarCodigoPorCelular: jest.fn().mockResolvedValue(undefined),
      validarCodigoPorEmail: jest.fn(),
      eliminarCodigoPorEmail: jest.fn().mockResolvedValue(undefined),
    };
    const enviarNotificacionUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new VerificarCodigoUseCase(victimaRepositorio as never, codigoValidacionRepositorio as never, enviarNotificacionUseCase as never);

    return {
      useCase,
      victimaRepositorio,
      codigoValidacionRepositorio,
      enviarNotificacionUseCase,
    };
  };

  it('valida OTP y retorna una API Key para la victima', async () => {
    const { useCase, victimaRepositorio, codigoValidacionRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-1',
      celular: '77777777',
      estadoCuenta: EstadoCuenta.ACTIVA,
      apiKey: 'api-antigua',
      fcmToken: null,
    });
    codigoValidacionRepositorio.validarCodigoPorCelular.mockResolvedValue(true);

    // Act: verificar codigo correcto para canal WhatsApp.
    const resultado = await useCase.ejecutar({
      idVictima: 'victima-1',
      canal: CanalSolicitudCodigo.WHATSAPP,
      codigo: '123456',
    });

    // Assert: validar actualizacion de API key y respuesta final.
    expect(codigoValidacionRepositorio.validarCodigoPorCelular).toHaveBeenCalledWith('77777777', '123456');
    expect(victimaRepositorio.actualizarApiKey).toHaveBeenCalledWith('victima-1', 'api-key-hash-demo');
    expect(resultado).toEqual({
      victima: {
        id: 'victima-1',
        apiKey: 'api-key-demo',
      },
    });
  });

  it('lanza NotFoundException cuando la victima no existe', async () => {
    const { useCase, victimaRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue(null);

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-x',
        canal: CanalSolicitudCodigo.WHATSAPP,
        codigo: '123456',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza BadRequestException si WhatsApp no tiene celular', async () => {
    const { useCase, victimaRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-1',
      celular: '   ',
      estadoCuenta: EstadoCuenta.ACTIVA,
    });

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-1',
        canal: CanalSolicitudCodigo.WHATSAPP,
        codigo: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException si en WhatsApp el celular es nullish', async () => {
    const { useCase, victimaRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-1',
      celular: undefined,
      estadoCuenta: EstadoCuenta.ACTIVA,
    });

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-1',
        canal: CanalSolicitudCodigo.WHATSAPP,
        codigo: '123456',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException si el codigo de WhatsApp es invalido', async () => {
    const { useCase, victimaRepositorio, codigoValidacionRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-1',
      celular: '77777777',
      estadoCuenta: EstadoCuenta.ACTIVA,
    });
    codigoValidacionRepositorio.validarCodigoPorCelular.mockResolvedValue(false);

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-1',
        canal: CanalSolicitudCodigo.WHATSAPP,
        codigo: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('valida codigo por email, actualiza api key y elimina codigo por correo', async () => {
    const { useCase, victimaRepositorio, codigoValidacionRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-2',
      correo: 'TEST@MAIL.COM',
      estadoCuenta: EstadoCuenta.SUSPENDIDA,
      apiKey: null,
      fcmToken: null,
    });
    codigoValidacionRepositorio.validarCodigoPorEmail.mockResolvedValue(true);

    const resultado = await useCase.ejecutar({
      idVictima: 'victima-2',
      canal: CanalSolicitudCodigo.EMAIL,
      codigo: '555555',
    });

    expect(codigoValidacionRepositorio.validarCodigoPorEmail).toHaveBeenCalledWith('test@mail.com', '555555');
    expect(codigoValidacionRepositorio.eliminarCodigoPorEmail).toHaveBeenCalledWith('test@mail.com', '555555');
    expect(victimaRepositorio.actualizarApiKey).toHaveBeenCalledWith('victima-2', 'api-key-hash-demo');
    expect(resultado.victima.id).toBe('victima-2');
  });

  it('lanza BadRequestException si en canal email no existe correo registrado', async () => {
    const { useCase, victimaRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-no-mail',
      correo: '   ',
      estadoCuenta: EstadoCuenta.ACTIVA,
    });

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-no-mail',
        canal: CanalSolicitudCodigo.EMAIL,
        codigo: '111111',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException si en email el correo es nullish', async () => {
    const { useCase, victimaRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-no-mail-2',
      correo: undefined,
      estadoCuenta: EstadoCuenta.ACTIVA,
    });

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-no-mail-2',
        canal: CanalSolicitudCodigo.EMAIL,
        codigo: '111111',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException cuando el codigo por email es invalido', async () => {
    const { useCase, victimaRepositorio, codigoValidacionRepositorio } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-mail-bad',
      correo: 'victima@mail.com',
      estadoCuenta: EstadoCuenta.ACTIVA,
      apiKey: null,
      fcmToken: null,
    });
    codigoValidacionRepositorio.validarCodigoPorEmail.mockResolvedValue(false);

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-mail-bad',
        canal: CanalSolicitudCodigo.EMAIL,
        codigo: '222222',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('envia notificacion de cierre de sesion cuando hay sesion activa y token push', async () => {
    const { useCase, victimaRepositorio, codigoValidacionRepositorio, enviarNotificacionUseCase } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-3',
      correo: 'victima@mail.com',
      estadoCuenta: EstadoCuenta.ACTIVA,
      apiKey: 'api-activa',
      fcmToken: '  fcm-token-1  ',
    });
    codigoValidacionRepositorio.validarCodigoPorEmail.mockResolvedValue(true);

    await useCase.ejecutar({
      idVictima: 'victima-3',
      canal: CanalSolicitudCodigo.EMAIL,
      codigo: '999999',
    });

    expect(enviarNotificacionUseCase.ejecutar).toHaveBeenCalledTimes(1);
    expect(enviarNotificacionUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        fcmToken: 'fcm-token-1',
        datos: expect.objectContaining({
          accion: 'CERRAR_SESION_REMOTA',
          idVictima: 'victima-3',
        }),
      }),
    );
  });

  it('registra warning si falla la notificacion push y no rompe la respuesta', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const { useCase, victimaRepositorio, codigoValidacionRepositorio, enviarNotificacionUseCase } = crearDependencias();
    victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
      id: 'victima-4',
      correo: 'victima4@mail.com',
      estadoCuenta: EstadoCuenta.ACTIVA,
      apiKey: 'api-activa',
      fcmToken: 'push-token',
    });
    codigoValidacionRepositorio.validarCodigoPorEmail.mockResolvedValue(true);
    enviarNotificacionUseCase.ejecutar.mockRejectedValue(new Error('push-fail'));

    await expect(
      useCase.ejecutar({
        idVictima: 'victima-4',
        canal: CanalSolicitudCodigo.EMAIL,
        codigo: '101010',
      }),
    ).resolves.toEqual({
      victima: {
        id: 'victima-4',
        apiKey: 'api-key-demo',
      },
    });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });
});
