import { Inject, Injectable, Logger } from '@nestjs/common';

import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';
import { DEPARTAMENTOS_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

export interface ProvinciaYDepartamentoResponse {
  municipio: {
    id: number;
    municipio: string;
  };
  provincia: {
    id: number;
    provincia: string;
  };
  departamento: {
    id: number;
    departamento: string;
  };
}

@Injectable()
export class ObtenerProvinciaDepartamentoUseCase {
  private readonly logger = new Logger(ObtenerProvinciaDepartamentoUseCase.name);

  constructor(
    @Inject(DEPARTAMENTOS_PORT_TOKEN)
    private readonly departamentosPort: DepartamentosPort,
  ) {}

  async ejecutar(idMunicipio: number): Promise<ProvinciaYDepartamentoResponse | null> {
    try {
      // Obtener la jerarquía completa desde el adaptador que usa el servicio externo cacheado
      const datos = await this.departamentosPort.obtenerProvinciaDepartamento(idMunicipio);

      return {
        municipio: {
          id: datos.municipio.id,
          municipio: datos.municipio.municipio,
        },
        provincia: {
          id: datos.provincia.id,
          provincia: datos.provincia.provincia,
        },
        departamento: {
          id: datos.departamento.id,
          departamento: datos.departamento.departamento,
        },
      };
    } catch (error) {
      this.logger.warn(`No se pudo obtener información del municipio ${idMunicipio}:`, error);
      return null;
    }
  }
}
