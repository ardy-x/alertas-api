import { Inject, Injectable } from '@nestjs/common';

import { Municipio } from '../../dominio/entidades/departamentos.entidad';
import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';
import { DEPARTAMENTOS_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerMunicipiosPorProvinciaUseCase {
  constructor(
    @Inject(DEPARTAMENTOS_PORT_TOKEN)
    private readonly departamentosPort: DepartamentosPort,
  ) {}

  async ejecutar(provinciaId: number): Promise<Municipio[]> {
    return this.departamentosPort.obtenerMunicipiosPorProvincia(provinciaId);
  }
}
