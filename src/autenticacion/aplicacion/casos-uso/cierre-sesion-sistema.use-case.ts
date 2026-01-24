import { Inject, Injectable } from '@nestjs/common';

import { KerberosPort } from '../../dominio/puertos/kerberos.port';
import { KERBEROS_PORT_TOKEN } from '../../dominio/tokens/autenticacion.tokens';

@Injectable()
export class CierreSesionSistemaUseCase {
  constructor(
    @Inject(KERBEROS_PORT_TOKEN)
    private readonly kerberosRepositorio: KerberosPort,
  ) {}

  async ejecutar(idSistema: string, accessToken: string): Promise<void> {
    await this.kerberosRepositorio.cierreSesionSistema(idSistema, accessToken);
  }
}
