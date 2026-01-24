import { Inject, Injectable } from '@nestjs/common';

import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';
import { DEPARTAMENTOS_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class CachearDepartamentosUseCase {
  constructor(
    @Inject(DEPARTAMENTOS_PORT_TOKEN)
    private readonly departamentosPort: DepartamentosPort,
  ) {}

  async ejecutar(): Promise<void> {
    await this.departamentosPort.cachearDepartamentos();
  }
}
