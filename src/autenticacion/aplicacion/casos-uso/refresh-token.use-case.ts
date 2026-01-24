import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenResponseDto } from '@/autenticacion/presentacion/dtos/salida/refresh-token-response.dto';
import { KerberosPort } from '../../dominio/puertos/kerberos.port';
import { KERBEROS_PORT_TOKEN } from '../../dominio/tokens/autenticacion.tokens';

@Injectable()
export class RefreshTokenUseCase {
  constructor(@Inject(KERBEROS_PORT_TOKEN) private readonly kerberosPort: KerberosPort) {}

  async ejecutar(refreshToken: string): Promise<RefreshTokenResponseDto> {
    const resultado = await this.kerberosPort.refreshToken(refreshToken);
    return {
      accessToken: resultado.access_token,
      refreshToken: resultado.refresh_token,
    };
  }
}
