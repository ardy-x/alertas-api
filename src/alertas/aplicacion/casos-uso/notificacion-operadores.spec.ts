/// <reference types="jest" />

import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { TipoDestinatario } from '@/notificaciones/dominio/entidades/notificacion.entity';

import { NotificarCreacionAlertaUseCase } from './notificar-creacion-alerta.use-case';

describe('Notificación a operadores conectados', () => {
  it('envía notificación websocket y push a operadores del departamento', async () => {
    // Arrange: preparar gateway y casos de uso de notificación simulados.
    const alertasGatewayPort = {
      notificarAlertaCreada: jest.fn(),
    };

    const enviarNotificacionesMultiplesUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };

    const obtenerTokensFCMUseCase = {
      ejecutar: jest.fn().mockResolvedValue(['token-1', 'token-2']),
    };

    const useCase = new NotificarCreacionAlertaUseCase(alertasGatewayPort as never, enviarNotificacionesMultiplesUseCase as never, obtenerTokensFCMUseCase as never);

    // Act: emitir la notificación de alerta creada.
    await useCase.ejecutar({
      idAlerta: 'alerta-1',
      estado: EstadoAlerta.PENDIENTE,
      origen: OrigenAlerta.FELCV,
      fechaHora: '2026-04-13T12:00:00.000Z',
      victima: 'Victima Demo',
      idDepartamento: 10,
    });

    // Assert: verificar notificación por websocket y notificaciones push.
    expect(alertasGatewayPort.notificarAlertaCreada).toHaveBeenCalledWith(expect.objectContaining({ idAlerta: 'alerta-1' }));
    expect(obtenerTokensFCMUseCase.ejecutar).toHaveBeenCalledWith(10);
    expect(enviarNotificacionesMultiplesUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoDestinatario: TipoDestinatario.USUARIO_WEB,
      }),
    );
  });

  it('solo notifica por websocket cuando no hay tokens FCM', async () => {
    const alertasGatewayPort = {
      notificarAlertaCreada: jest.fn(),
    };
    const enviarNotificacionesMultiplesUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };
    const obtenerTokensFCMUseCase = {
      ejecutar: jest.fn().mockResolvedValue([]),
    };

    const useCase = new NotificarCreacionAlertaUseCase(alertasGatewayPort as never, enviarNotificacionesMultiplesUseCase as never, obtenerTokensFCMUseCase as never);
    await useCase.ejecutar({
      idAlerta: 'alerta-2',
      estado: EstadoAlerta.PENDIENTE,
      origen: OrigenAlerta.FELCV,
      fechaHora: '2026-04-13T12:00:00.000Z',
      victima: 'Victima Demo',
      idDepartamento: 10,
    });

    expect(alertasGatewayPort.notificarAlertaCreada).toHaveBeenCalledTimes(1);
    expect(enviarNotificacionesMultiplesUseCase.ejecutar).not.toHaveBeenCalled();
  });

  it('no rompe el flujo cuando falla el envio push', async () => {
    const alertasGatewayPort = {
      notificarAlertaCreada: jest.fn(),
    };
    const enviarNotificacionesMultiplesUseCase = {
      ejecutar: jest.fn().mockRejectedValue(new Error('push-fail')),
    };
    const obtenerTokensFCMUseCase = {
      ejecutar: jest.fn().mockResolvedValue(['token-1']),
    };

    const useCase = new NotificarCreacionAlertaUseCase(alertasGatewayPort as never, enviarNotificacionesMultiplesUseCase as never, obtenerTokensFCMUseCase as never);

    await expect(
      useCase.ejecutar({
        idAlerta: 'alerta-3',
        estado: EstadoAlerta.PENDIENTE,
        origen: OrigenAlerta.FELCV,
        fechaHora: '2026-04-13T12:00:00.000Z',
        victima: 'Victima Demo',
        idDepartamento: 10,
      }),
    ).resolves.toBeUndefined();
  });
});
