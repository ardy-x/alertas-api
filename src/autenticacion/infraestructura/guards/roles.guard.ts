import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { APP_CONFIG } from '@/config/app.config';
import { RolesPermitidos } from '../../dominio/enums/roles-permitidos.enum';
import { IS_PUBLIC_KEY } from '../decoradores/public.decorator';
import { ROLES_KEY } from '../decoradores/roles-permitidos.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
    if (isPublic) {
      return true;
    }

    const rolesRequeridos = this.reflector.getAllAndOverride<RolesPermitidos[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    // Si no hay roles definidos, la ruta es accesible para cualquier usuario autenticado
    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: string } }>();

    // En desarrollo se omite la validación de rol, solo se requiere estar autenticado
    if (APP_CONFIG.isDevelopment) {
      this.logger.warn(`[DEV] Validación de roles omitida para rol: "${request.user?.role ?? 'desconocido'}". Roles requeridos: [${rolesRequeridos.join(', ')}]`);
      return true;
    }

    const rolUsuario = request.user?.role as RolesPermitidos | undefined;

    if (!rolUsuario) {
      this.logger.warn('El payload del token no contiene el campo role');
      throw new ForbiddenException('No tienes autorización para acceder a este recurso');
    }

    const tieneRol = rolesRequeridos.includes(rolUsuario);

    if (!tieneRol) {
      this.logger.warn(`Acceso denegado. Rol del usuario: "${rolUsuario}". Roles requeridos: [${rolesRequeridos.join(', ')}]`);
      throw new ForbiddenException('No tienes el rol necesario para acceder a este recurso');
    }

    return true;
  }
}
