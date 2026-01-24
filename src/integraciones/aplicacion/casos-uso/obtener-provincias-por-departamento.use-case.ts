import { Inject, Injectable } from '@nestjs/common';

import { Provincia } from '../../dominio/entidades/departamentos.entidad';
import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';
import { DEPARTAMENTOS_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerProvinciasPorDepartamentoUseCase {
  constructor(
    @Inject(DEPARTAMENTOS_PORT_TOKEN)
    private readonly departamentosPort: DepartamentosPort,
  ) {}

  async ejecutar(departamentoId: number): Promise<Provincia[]> {
    return this.departamentosPort.obtenerProvinciasPorDepartamento(departamentoId);
  }
}
