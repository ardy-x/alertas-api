import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { APP_CONFIG } from '@/config/app.config';

@Injectable()
export class ServiceApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ServiceApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    if (APP_CONFIG.isDevelopment) {
      this.logger.warn('[DEV] Validación de API key de servicio omitida');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = (request.headers as Record<string, string | undefined>)['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key de servicio no proporcionada');
    }

    if (apiKey !== APP_CONFIG.jupiterApiKey) {
      throw new UnauthorizedException('API key de servicio inválida');
    }

    return true;
  }
}
