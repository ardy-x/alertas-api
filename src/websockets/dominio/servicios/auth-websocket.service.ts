import * as fs from 'node:fs';
import * as path from 'node:path';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  userSystemId: string;
}

@Injectable()
export class AuthWebSocketService {
  private publicKey: string;

  constructor() {
    this.publicKey = fs.readFileSync(path.join(process.cwd(), 'keys', 'public.pem'), 'utf8');
  }

  validarToken(token: string): { idUsuario: string; userSystemId: string } {
    try {
      const payload = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as TokenPayload;
      return {
        idUsuario: payload.userId,
        userSystemId: payload.userSystemId,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expirado');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Token inválido');
      }
      throw new UnauthorizedException('Error de autenticación');
    }
  }

  validarDatosConexion(query: Record<string, unknown>): { tipo: string; idDepartamento: number } {
    const { tipo, idDepartamento: idDepStr } = query;

    if (!tipo || !idDepStr) {
      throw new UnauthorizedException('Faltan parámetros');
    }

    // Convertir a string primero para evitar toString() implícito
    const idDepStrValue = typeof idDepStr === 'string' || typeof idDepStr === 'number' ? String(idDepStr) : '';
    const idDepartamento = parseInt(idDepStrValue, 10);
    if (Number.isNaN(idDepartamento)) {
      throw new UnauthorizedException('idDepartamento inválido');
    }

    if (tipo !== 'SUPERVISOR') {
      throw new UnauthorizedException('Solo supervisores permitidos');
    }

    return { tipo, idDepartamento };
  }
}
