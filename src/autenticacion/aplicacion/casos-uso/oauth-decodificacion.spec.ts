/// <reference types="jest" />

import * as fs from 'node:fs';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { DecodificarTokenUseCase } from './decodificar-token.use-case';

describe('Intercambio OAuth 2.0 con KERBEROS y decodificación de token', () => {
  it('realiza intercambio de codigo y decodifica JWT correctamente', async () => {
    // Arrange: simular lectura de llave publica, Kerberos y servicios dependientes.
    jest.spyOn(fs, 'readFileSync').mockReturnValue('fake-public-key');
    jest.spyOn(jwt, 'verify').mockReturnValue({
      systemData: { role: 'OPERADOR' },
      userData: {
        username: 'operador.demo',
        userId: 'user-1',
        grado: 'Sgto.',
        fullName: 'Operador Demo',
        unidad: 'FELCV',
      },
      tokens: { accessToken: 'a', refreshToken: 'r' },
    } as never);

    const kerberosPort = {
      intercambioCodigo: jest.fn().mockResolvedValue('jwt-token-demo'),
    };
    const registrarUsuarioWebUseCase = {
      ejecutar: jest.fn().mockResolvedValue(undefined),
    };
    const encontrarDepartamentoUseCase = {
      ejecutar: jest.fn().mockResolvedValue({
        departamento: { id: 10, departamento: 'La Paz' },
      }),
    };

    const useCase = new DecodificarTokenUseCase(kerberosPort as never, registrarUsuarioWebUseCase as never, encontrarDepartamentoUseCase as never);

    // Act: ejecutar flujo de intercambio OAuth y decodificacion del token.
    await useCase.ejecutar({
      codigo: '7d0d7a79-3ae0-4bd6-9d7e-d8e6adfcb7d1',
      latitud: -16.5,
      longitud: -68.15,
    });

    // Assert: validar intercambio, verificacion JWT y registro de usuario.
    expect(kerberosPort.intercambioCodigo).toHaveBeenCalledWith('7d0d7a79-3ae0-4bd6-9d7e-d8e6adfcb7d1');
    expect(jwt.verify).toHaveBeenCalled();
    expect(registrarUsuarioWebUseCase.ejecutar).toHaveBeenCalledWith(expect.objectContaining({ id: 'user-1', rol: 'OPERADOR' }));
  });

  it('lanza UnauthorizedException cuando el JWT expiró', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('fake-public-key');
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.TokenExpiredError('expirado', new Date());
    });

    const useCase = new DecodificarTokenUseCase({ intercambioCodigo: jest.fn().mockResolvedValue('jwt-exp') } as never, { ejecutar: jest.fn() } as never, { ejecutar: jest.fn() } as never);

    await expect(
      useCase.ejecutar({
        codigo: 'codigo-exp',
        latitud: -16.5,
        longitud: -68.15,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lanza BadRequestException cuando el JWT es invalido', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('fake-public-key');
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalido');
    });

    const useCase = new DecodificarTokenUseCase({ intercambioCodigo: jest.fn().mockResolvedValue('jwt-bad') } as never, { ejecutar: jest.fn() } as never, { ejecutar: jest.fn() } as never);

    await expect(
      useCase.ejecutar({
        codigo: 'codigo-bad',
        latitud: -16.5,
        longitud: -68.15,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lanza BadRequestException cuando faltan datos requeridos en el token', async () => {
    jest.spyOn(fs, 'readFileSync').mockReturnValue('fake-public-key');
    jest.spyOn(jwt, 'verify').mockReturnValue({
      systemData: null,
      userData: null,
      tokens: null,
    } as never);

    const useCase = new DecodificarTokenUseCase(
      { intercambioCodigo: jest.fn().mockResolvedValue('jwt-missing') } as never,
      { ejecutar: jest.fn() } as never,
      { ejecutar: jest.fn().mockResolvedValue({ departamento: { id: 10, departamento: 'La Paz' } }) } as never,
    );

    await expect(
      useCase.ejecutar({
        codigo: 'codigo-missing',
        latitud: -16.5,
        longitud: -68.15,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
