import { Inject, Injectable } from '@nestjs/common';

import { MunicipioProvinciaDepartamento } from '../../dominio/entidades/departamentos.entidad';
import { GeoServerPort } from '../../dominio/puertos/geo-server.port';
import { GEO_SERVER_TOKEN } from '../../dominio/tokens/integracion.tokens';

export interface EncontrarDepartamentoPorUbicacion {
  latitud: number;
  longitud: number;
}

@Injectable()
export class EncontrarDepartamentoUseCase {
  constructor(
    @Inject(GEO_SERVER_TOKEN)
    private readonly geoServerPort: GeoServerPort,
  ) {}

  async ejecutar(datos: EncontrarDepartamentoPorUbicacion): Promise<MunicipioProvinciaDepartamento> {
    return this.geoServerPort.encontrarDepartamento({
      ubicacion: {
        latitud: datos.latitud,
        longitud: datos.longitud,
      },
    });
  }
}
