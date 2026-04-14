/// <reference types="jest" />

import { Logger, NotFoundException } from '@nestjs/common';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';
import { SuspenderCuentaUseCase } from '@/victimas/aplicacion/casos-uso/web/suspender-cuenta.use-case';

describe('Suspensión de cuenta y deshabilitación de API Key', () => {
  it('suspende cuenta y envía notificación push si existe token FCM', async () => {
    // Arrange: simular víctima con token push y repositorio de suspensión.
    const victimaRepositorio = {
      obtenerVictimaConDispositivo: jest.fn().mockResolvedValue({
        id: 'victima-1',
        fcmToken: 'token-fcm-1',
      }),
    };
    const alertaVictimaRepositorio = {
      suspenderCuenta: jest.fn().mockResolvedValue(undefined),
    };
    const enviarNotificacionUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new SuspenderCuentaUseCase(victimaRepositorio as never, alertaVictimaRepositorio as never, enviarNotificacionUseCase as never);

    // Act: ejecutar suspensión de cuenta.
    await useCase.ejecutar('victima-1');

    // Assert: verificar suspensión y notificación a la víctima.
    expect(alertaVictimaRepositorio.suspenderCuenta).toHaveBeenCalledWith('victima-1');
    expect(enviarNotificacionUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        fcmToken: 'token-fcm-1',
        tipoDestinatario: TipoDestinatario.VICTIMA,
      }),
    );
  });

  it('lanza NotFoundException cuando no existe victima', async () => {
    const useCase = new SuspenderCuentaUseCase(
      {
        obtenerVictimaConDispositivo: jest.fn().mockResolvedValue(null),
      } as never,
      {
        suspenderCuenta: jest.fn(),
      } as never,
      {
        ejecutar: jest.fn(),
      } as never,
    );

    await expect(useCase.ejecutar('victima-404')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('suspende cuenta sin enviar push si no existe token FCM', async () => {
    const alertaVictimaRepositorio = {
      suspenderCuenta: jest.fn().mockResolvedValue(undefined),
    };
    const enviarNotificacionUseCase = {
      ejecutar: jest.fn(),
    };

    const useCase = new SuspenderCuentaUseCase(
      {
        obtenerVictimaConDispositivo: jest.fn().mockResolvedValue({
          id: 'victima-2',
          fcmToken: '   ',
        }),
      } as never,
      alertaVictimaRepositorio as never,
      enviarNotificacionUseCase as never,
    );

    await useCase.ejecutar('victima-2');

    expect(alertaVictimaRepositorio.suspenderCuenta).toHaveBeenCalledWith('victima-2');
    expect(enviarNotificacionUseCase.ejecutar).not.toHaveBeenCalled();
  });

  it('no interrumpe suspension cuando falla el envio push', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    const alertaVictimaRepositorio = {
      suspenderCuenta: jest.fn().mockResolvedValue(undefined),
    };
    const enviarNotificacionUseCase = {
      ejecutar: jest.fn().mockRejectedValue(new Error('push-fail')),
    };

    const useCase = new SuspenderCuentaUseCase(
      {
        obtenerVictimaConDispositivo: jest.fn().mockResolvedValue({
          id: 'victima-3',
          fcmToken: 'token-fcm-3',
        }),
      } as never,
      alertaVictimaRepositorio as never,
      enviarNotificacionUseCase as never,
    );

    await expect(useCase.ejecutar('victima-3')).resolves.toBeUndefined();
    expect(alertaVictimaRepositorio.suspenderCuenta).toHaveBeenCalledWith('victima-3');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
