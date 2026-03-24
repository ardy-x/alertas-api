import { CanActivate, ExecutionContext, Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { APP_CONFIG } from '@/config/app.config';
import { hashString } from '@/utils/security.utils';
import { ClavesApiPort } from '../../dominio/puertos/claves-api.port';
import { CLAVES_API_PORT_TOKEN } from '../../dominio/tokens/victima.tokens';

@Injectable()
export class ClaveApiGuard implements CanActivate {
  private readonly logger = new Logger(ClaveApiGuard.name);

  constructor(
    @Inject(CLAVES_API_PORT_TOKEN)
    private readonly clavesApiPort: ClavesApiPort,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { victima?: unknown; claveApi?: string }>();

    if (APP_CONFIG.isDevelopment) {
      this.logger.warn('[DEV] Validación de clave API omitida');
      return true;
    }

    const claveApi = (request.headers as unknown as Record<string, string | undefined>)['x-api-key'] || (request.headers as unknown as Record<string, string | undefined>)['xapikey'];

    if (!claveApi) {
      throw new UnauthorizedException('Clave API requerida en header X-API-Key');
    }

    try {
      const claveApiHash = hashString(claveApi);
      const clave = await this.clavesApiPort.obtenerPorClave(claveApiHash);
      if (!clave || clave.estadoCuenta !== 'ACTIVA') {
        throw new UnauthorizedException('Clave API inválida o cuenta inactiva');
      }
      // Adjuntar datos de la víctima al request para uso posterior
      request.victima = clave;
      request.claveApi = claveApi;
      return true;
    } catch (error) {
      throw new UnauthorizedException(`Error al validar clave API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
