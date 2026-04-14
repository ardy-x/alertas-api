import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decoradores/public.decorator';

@Injectable()
export class KerberosJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true; // Salta la autenticación
    }
    return super.canActivate(context);
  }

  // biome-ignore lint/suspicious/noExplicitAny: Firma requerida por AuthGuard de @nestjs/passport
  handleRequest<TUser = any>(err: any, user: any, info: any, _context: ExecutionContext, _status?: any): TUser {
    switch (info?.message) {
      case 'No auth token':
        throw new UnauthorizedException('Token de autenticación no proporcionado');
      case 'jwt expired':
        throw new UnauthorizedException('Tu sesión ha expirado');
      case 'invalid token':
        throw new UnauthorizedException('La sesión no es válida');
      case 'jwt malformed':
        throw new UnauthorizedException('El token de sesión tiene un formato inválido');
      case 'invalid signature':
        throw new UnauthorizedException('La sesión no pudo ser verificada');
      case 'jwt not active':
        throw new UnauthorizedException('La sesión aún no está activa');
    }

    if (err || !user) {
      throw new UnauthorizedException(err?.message || 'No tienes autorización para acceder a este recurso');
    }

    return user;
  }
}
