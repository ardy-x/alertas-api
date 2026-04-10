/// <reference types="jest" />

import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';

import { DecodificarTokenUseCase } from './decodificar-token.use-case';

jest.mock('node:fs', () => ({
  readFileSync: jest.fn(() => 'PUBLIC_KEY_MOCK'),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  TokenExpiredError: class TokenExpiredError extends Error {},
  JsonWebTokenError: class JsonWebTokenError extends Error {},
}));

jest.mock('../../infraestructura/adaptadores/kerberos.adapter', () => ({
  KerberosAdapter: jest.fn(),
}));

describe('DecodificarTokenUseCase', () => {
  const kerberosPort = {
    intercambioCodigo: jest.fn(),
  };

  const registrarUsuarioWebUseCase = {
    ejecutar: jest.fn(),
  };

  const encontrarDepartamentoUseCase = {
    ejecutar: jest.fn(),
  };

  let useCase: DecodificarTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DecodificarTokenUseCase(kerberosPort as never, registrarUsuarioWebUseCase as never, encontrarDepartamentoUseCase as never);
  });

  it('intercambia código OAuth con KERBEROS, valida JWT y extrae rol del usuario', async () => {
    kerberosPort.intercambioCodigo.mockResolvedValue('jwt.token.mock');

    encontrarDepartamentoUseCase.ejecutar.mockResolvedValue({
      departamento: { id: 3, departamento: 'Cochabamba' },
      provincia: { id: 30, provincia: 'Cercado' },
      municipio: { id: 300, municipio: 'Cochabamba' },
    });

    (jwt.verify as jest.Mock).mockReturnValue({
      systemData: {
        id: 'sys-1',
        modules: [],
        permissions: ['ALERTA_CREAR'],
        role: 'OPERADOR',
      },
      userData: {
        userId: 'usr-1',
        username: 'operador1',
        email: 'operador@test.com',
        active: true,
        fullName: 'Operador Uno',
        imageUser: 'img',
        verified: true,
        createdAt: '2026-01-01',
        lastAccess: '2026-04-09',
        unidad: 'FELCV',
        grado: 'Sgto',
      },
      tokens: {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      },
      iat: 100,
      exp: 200,
    });

    const respuesta = await useCase.ejecutar({
      codigo: '8ab5b2f6-69b0-4b4f-8274-093faffb0c72',
      latitud: -16.5,
      longitud: -68.15,
    });

    expect(kerberosPort.intercambioCodigo).toHaveBeenCalledWith('8ab5b2f6-69b0-4b4f-8274-093faffb0c72');
    expect(jwt.verify).toHaveBeenCalledWith('jwt.token.mock', 'PUBLIC_KEY_MOCK', { algorithms: ['RS256'] });

    expect(registrarUsuarioWebUseCase.ejecutar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'usr-1',
        rol: 'OPERADOR',
        idDepartamento: 3,
      }),
    );

    expect(respuesta.datosSistema.rol).toBe('OPERADOR');
  });

  it('lanza UnauthorizedException si el token JWT está expirado', async () => {
    kerberosPort.intercambioCodigo.mockResolvedValue('jwt.expirado');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new (jwt.TokenExpiredError as unknown as new () => Error)();
    });

    await expect(
      useCase.ejecutar({
        codigo: 'f072a342-dc5b-4426-8ddd-eb36d04d4f09',
        latitud: -16.5,
        longitud: -68.15,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lanza BadRequestException si el JWT es inválido', async () => {
    kerberosPort.intercambioCodigo.mockResolvedValue('jwt.invalido');
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new (jwt.JsonWebTokenError as unknown as new () => Error)();
    });

    await expect(
      useCase.ejecutar({
        codigo: 'f072a342-dc5b-4426-8ddd-eb36d04d4f09',
        latitud: -16.5,
        longitud: -68.15,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
