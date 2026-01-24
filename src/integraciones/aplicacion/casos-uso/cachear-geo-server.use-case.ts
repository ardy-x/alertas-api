import { Inject, Injectable } from '@nestjs/common';

import { GeoServerPort } from '../../dominio/puertos/geo-server.port';
import { GEO_SERVER_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class CachearMunicipiosGeoServerUseCase {
  constructor(
    @Inject(GEO_SERVER_TOKEN)
    private readonly geoServerPort: GeoServerPort,
  ) {}

  async ejecutar(): Promise<void> {
    await this.geoServerPort.cachearMunicipiosGeoServer();
  }
}
