import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPrivadoService } from '@/core/utilidades/http-client-privado.service';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp, esErrorTimeout } from '@/core/utilidades/http-error.util';
import { KerberosPort } from '../../dominio/puertos/kerberos.port';

export interface KerberosUsuarioSistema {
  id: string;
  nombreCompleto: string;
  numeroDocumento: string;
  fotografiaUrl: string;
  grado: string;
  unidad: string;
  role: string;
  estado: boolean;
}

export interface KerberosPaginacion {
  total: number;
  currentPage: number;
  itemsPerPage: number;
  lastPage: number;
}

const KERBEROS_ENDPOINTS = {
  EXCHANGE_CODE: '/auth/exchange-code',
  SYSTEM_LOGOUT: '/auth/system-logout',
  REFRESH: '/auth/refresh',
} as const;

interface KerberosApiResponse<T = void> {
  data?: T;
  meta: {
    status: number;
    statusMessage: string;
  };
}

interface IntercambioCodigoDatos {
  token: string;
}

interface RefreshTokenDatos {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class KerberosAdapter implements KerberosPort {
  private readonly logger = new Logger(KerberosAdapter.name);
  private readonly kerberosUrl = SERVICIOS_CONFIG.kerberosApiBase;

  constructor(
    private readonly httpClientPublico: HttpClientPublicoService,
    private readonly httpClientPrivado: HttpClientPrivadoService,
  ) {}

  async intercambioCodigo(code: string): Promise<{ token: string }> {
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.EXCHANGE_CODE}`;
    try {
      const response = await this.httpClientPublico.post<KerberosApiResponse<IntercambioCodigoDatos>>(url, { code });
      this.logger.log('Intercambio exitoso, token recibido');
      return response.data!;
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error en intercambioCodigo desde ${url} - Status: ${infoError.status}, Mensaje: ${infoError.mensaje}`);
      if (infoError.status === 400) {
        throw new BadRequestException(`Código de autenticación inválido: ${code}`);
      } else if (infoError.status === 403) {
        throw new ForbiddenException('Código de autenticación expirado o ya utilizado');
      } else if (esErrorTimeout(error)) {
        throw new ServiceUnavailableException('Tiempo de espera agotado al conectar con el servidor de Kerberos');
      } else {
        throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${infoError.status}`);
      }
    }
  }

  async cierreSesionSistema(idSistema: string, accessToken: string): Promise<void> {
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.SYSTEM_LOGOUT}`;
    try {
      await this.httpClientPrivado.post(url, accessToken, { systemId: idSistema });
      this.logger.log('Cierre de sesión del sistema exitoso');
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error en cierreSesionSistema desde ${url} - Status: ${infoError.status}, Mensaje: ${infoError.mensaje}`);
      if (infoError.status === 401) {
        throw new BadRequestException('Token de autenticación expirado');
      } else if (esErrorTimeout(error)) {
        throw new ServiceUnavailableException('Tiempo de espera agotado al conectar con el servidor de Kerberos');
      } else {
        throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${infoError.status}`);
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const url = `${this.kerberosUrl}${KERBEROS_ENDPOINTS.REFRESH}`;
    try {
      const response = await this.httpClientPrivado.get<KerberosApiResponse<RefreshTokenDatos>>(url, refreshToken);
      this.logger.log('Refresh token exitoso');
      return response.data!;
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error en refreshToken desde ${url} - Status: ${infoError.status}, Mensaje: ${infoError.mensaje}`);
      if (infoError.status === 401) {
        throw new BadRequestException('Tu sesión ha expirado completamente. Por favor, inicia sesión nuevamente');
      } else if (esErrorTimeout(error)) {
        throw new ServiceUnavailableException('Tiempo de espera agotado al conectar con el servidor de Kerberos');
      } else {
        throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${infoError.status}`);
      }
    }
  }

  async obtenerUsuariosSistema(idSistema: string, accessToken: string, busqueda?: string): Promise<{ data: KerberosUsuarioSistema[]; meta: KerberosPaginacion }> {
    const params = new URLSearchParams();
    if (busqueda) params.set('search', busqueda);

    const url = `${this.kerberosUrl}/systems/${idSistema}/get-users${params.toString() ? `?${params.toString()}` : ''}`;
    this.logger.log(`Llamando a Kerberos: ${url} con idSistema: ${idSistema}, busqueda: ${busqueda}`);
    try {
      const response = await this.httpClientPrivado.get<{ data: KerberosUsuarioSistema[]; meta: KerberosPaginacion }>(url, accessToken);
      this.logger.log('Obtención de usuarios del sistema exitoso');

      return response;
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error en obtenerUsuariosSistema desde ${url} - Status: ${infoError.status}, Mensaje: ${infoError.mensaje}`);
      if (infoError.status === 401) {
        throw new BadRequestException('Token de autenticación expirado o inválido');
      } else if (esErrorTimeout(error)) {
        throw new ServiceUnavailableException('Tiempo de espera agotado al conectar con el servidor de Kerberos');
      } else {
        throw new InternalServerErrorException(`Error en el servidor de Kerberos: ${infoError.status}`);
      }
    }
  }
}
