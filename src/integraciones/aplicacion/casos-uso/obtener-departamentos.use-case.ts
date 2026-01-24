import { Inject, Injectable } from '@nestjs/common';

import { Departamento } from '../../dominio/entidades/departamentos.entidad';
import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';
import { DEPARTAMENTOS_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerDepartamentosUseCase {
  constructor(
    @Inject(DEPARTAMENTOS_PORT_TOKEN)
    private readonly departamentosPort: DepartamentosPort,
  ) {}

  async ejecutar(): Promise<Departamento[]> {
    return this.departamentosPort.obtenerDepartamentos();
  }
}
