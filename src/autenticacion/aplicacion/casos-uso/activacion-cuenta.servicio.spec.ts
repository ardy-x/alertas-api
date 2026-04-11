/// <reference types="jest" />

import { BadRequestException, NotFoundException } from '@nestjs/common';

import { obtenerFechaBoliviaYYYYMMDD } from '@/utils/fecha.utils';
import { generarApiKey, hashString } from '@/utils/security.utils';
import { SolicitarCodigoUseCase } from '@/victimas/aplicacion/casos-uso/validacion/solicitar-codigo.use-case';
import { VerificarCodigoUseCase } from '@/victimas/aplicacion/casos-uso/validacion/verificar-codigo.use-case';
import { VerificarDenunciaUseCase } from '@/victimas/aplicacion/casos-uso/verificar-denuncia.use-case';
import { CanalSolicitudCodigo } from '@/victimas/presentacion/dto/entrada/validacion/solicitar-codigo-request.dto';

jest.mock('@/utils/security.utils', () => ({
  generarApiKey: jest.fn(),
  hashString: jest.fn(),
}));

jest.mock('@/utils/fecha.utils', () => ({
  obtenerFechaBoliviaYYYYMMDD: jest.fn(),
}));

describe('Flujo de Activacion de Cuenta', () => {
  describe('Paso 1: Validar CI/CUD contra JUPITER', () => {
    const verificarDenunciaPort = {
      verificarDenuncia: jest.fn(),
    };

    let useCase: VerificarDenunciaUseCase;

    beforeEach(() => {
      jest.clearAllMocks();
      useCase = new VerificarDenunciaUseCase(verificarDenunciaPort as never);
    });

    it('valida CI y CUD en JUPITER y retorna datos de la victima', async () => {
      verificarDenunciaPort.verificarDenuncia.mockResolvedValue({
        victima: {
          id: 'victima-1',
          cedulaIdentidad: '1234567',
          nombreCompleto: 'Victima Demo',
        },
      });

      const respuesta = await useCase.ejecutar('CUD-2026-001', '1234567');

      expect(verificarDenunciaPort.verificarDenuncia).toHaveBeenCalledWith('CUD-2026-001', '1234567');
      expect(respuesta).toEqual(
        expect.objectContaining({
          id: 'victima-1',
          cedulaIdentidad: '1234567',
        }),
      );
    });
  });

  describe('Paso 2: Generar OTP y almacenar en Redis con TTL', () => {
    const victimaRepositorio = {
      obtenerVictimaConDispositivo: jest.fn(),
    };

    const codigoValidacionRepositorio = {
      eliminarCodigoPorCelular: jest.fn(),
      eliminarCodigoPorEmail: jest.fn(),
      obtenerIntentosPorCelular: jest.fn(),
      crear: jest.fn(),
      incrementarIntentosPorCelular: jest.fn(),
    };

    const mensajePort = {
      enviarMensajeWhatsapp: jest.fn(),
    };

    let useCase: SolicitarCodigoUseCase;

    beforeEach(() => {
      jest.clearAllMocks();
      useCase = new SolicitarCodigoUseCase(victimaRepositorio as never, codigoValidacionRepositorio as never, mensajePort as never);
    });

    it('genera OTP de 6 digitos y lo guarda en Redis con TTL de 600 segundos', async () => {
      victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({
        id: 'victima-1',
        nombreCompleto: 'Victima Demo',
        celular: '70000000',
        correo: 'victima@test.com',
      });
      codigoValidacionRepositorio.obtenerIntentosPorCelular.mockResolvedValue(0);
      mensajePort.enviarMensajeWhatsapp.mockResolvedValue(true);
      (obtenerFechaBoliviaYYYYMMDD as jest.Mock).mockReturnValue('2026-04-09');
      jest.spyOn(Math, 'random').mockReturnValue(0.123456);

      const respuesta = await useCase.ejecutar({ idVictima: 'victima-1', canal: CanalSolicitudCodigo.WHATSAPP });

      expect(codigoValidacionRepositorio.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          celular: '70000000',
          codigo: expect.stringMatching(/^\d{6}$/),
        }),
        600,
      );
      expect(respuesta).toEqual(
        expect.objectContaining({
          codigoEnviado: true,
        }),
      );
    });
  });

  describe('Paso 3: Generar API Key al verificar OTP', () => {
    const victimaRepositorio = {
      obtenerVictimaConDispositivo: jest.fn(),
      actualizarApiKey: jest.fn(),
    };

    const codigoValidacionRepositorio = {
      validarCodigoPorCelular: jest.fn(),
      eliminarCodigoPorCelular: jest.fn(),
    };

    const enviarNotificacionUseCase = {
      ejecutar: jest.fn(),
    };

    let useCase: VerificarCodigoUseCase;

    beforeEach(() => {
      jest.clearAllMocks();
      useCase = new VerificarCodigoUseCase(victimaRepositorio as never, codigoValidacionRepositorio as never, enviarNotificacionUseCase as never);
    });

    it('valida OTP en Redis, genera API key, guarda hash y elimina codigo usado', async () => {
      codigoValidacionRepositorio.validarCodigoPorCelular.mockResolvedValue(true);
      victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue({ id: 'victima-1', celular: '70000000' });
      (generarApiKey as jest.Mock).mockReturnValue('api-key-raw');
      (hashString as jest.Mock).mockReturnValue('api-key-hash');

      const respuesta = await useCase.ejecutar({
        idVictima: 'victima-1',
        canal: CanalSolicitudCodigo.WHATSAPP,
        codigo: '123456',
      });

      expect(codigoValidacionRepositorio.validarCodigoPorCelular).toHaveBeenCalledWith('70000000', '123456');
      expect(generarApiKey).toHaveBeenCalledTimes(1);
      expect(hashString).toHaveBeenCalledWith('api-key-raw');
      expect(victimaRepositorio.actualizarApiKey).toHaveBeenCalledWith('victima-1', 'api-key-hash');
      expect(codigoValidacionRepositorio.eliminarCodigoPorCelular).toHaveBeenCalledWith('70000000', '123456');
      expect(respuesta).toEqual({
        victima: {
          id: 'victima-1',
          apiKey: 'api-key-raw',
        },
      });
    });

    it('lanza BadRequestException cuando el codigo es invalido o expirado', async () => {
      codigoValidacionRepositorio.validarCodigoPorCelular.mockResolvedValue(false);

      await expect(
        useCase.ejecutar({
          idVictima: 'victima-1',
          canal: CanalSolicitudCodigo.WHATSAPP,
          codigo: '000000',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(victimaRepositorio.obtenerVictimaConDispositivo).toHaveBeenCalledWith('victima-1');
      expect(victimaRepositorio.actualizarApiKey).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException cuando no existe victima para el id', async () => {
      codigoValidacionRepositorio.validarCodigoPorCelular.mockResolvedValue(true);
      victimaRepositorio.obtenerVictimaConDispositivo.mockResolvedValue(null);

      await expect(
        useCase.ejecutar({
          idVictima: 'victima-1',
          canal: CanalSolicitudCodigo.WHATSAPP,
          codigo: '123456',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(victimaRepositorio.actualizarApiKey).not.toHaveBeenCalled();
      expect(codigoValidacionRepositorio.eliminarCodigoPorCelular).not.toHaveBeenCalled();
    });
  });
});
