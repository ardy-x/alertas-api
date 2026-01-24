import { Inject, Injectable } from '@nestjs/common';

import { Unidad } from '../../dominio/entidades/unidades.entidad';
import { UnidadesPort } from '../../dominio/puertos/unidades.port';
import { UNIDADES_PORT_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerUnidadesCercanasUseCase {
  constructor(@Inject(UNIDADES_PORT_TOKEN) private readonly unidadesPort: UnidadesPort) {}

  async ejecutar({ latitud, longitud }: { latitud: number; longitud: number }): Promise<Unidad[]> {
    const unidades = await this.unidadesPort.obtenerUnidadesCercanas(latitud, longitud);

    // Ordenar por distancia y tomar las 5 más cercanas
    const unidadesOrdenadas = unidades
      .map((unidad) => ({
        ...unidad,
        distancia: this.calcularDistancia(latitud, longitud, unidad.ubicacion.latitud, unidad.ubicacion.longitud),
      }))
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 5);

    // Devolver solo las unidades sin la distancia calculada

    return unidadesOrdenadas.map(({ distancia: _distancia, ...unidad }) => unidad);
  }

  private calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
