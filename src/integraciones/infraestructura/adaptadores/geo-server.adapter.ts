import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import * as turf from '@turf/turf';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp } from '@/core/utilidades/http-error.util';
import { MunicipioProvinciaDepartamento } from '@/integraciones/dominio/entidades/departamentos.entidad';
import { RedisService } from '@/redis/redis.service';

import { EncontrarDepartamento, GeoServerPort } from '../../dominio/puertos/geo-server.port';

interface MunicipioProperties {
  departamen: string;
  provincia: string;
  municipio: string;
  departamento_id: number;
  mun_id: number;
}

interface MunicipioCacheado {
  properties: MunicipioProperties;
  geometria: {
    type: 'MultiPolygon';
    coordinates: [[[number, number][]]];
  };
}

@Injectable()
export class GeoServerAdapter implements GeoServerPort {
  private readonly logger = new Logger(GeoServerAdapter.name);
  private readonly CACHE_KEY = 'geo_server';
  private readonly urlGeoserver: string;
  private cacheandoEnProgreso = false;

  constructor(
    private readonly httpClientPublico: HttpClientPublicoService,
    private readonly redisService: RedisService,
  ) {
    this.urlGeoserver = SERVICIOS_CONFIG.geoServerApiBase;
  }

  private async obtenerMunicipiosCacheados(): Promise<MunicipioCacheado[]> {
    const cached = await this.redisService.get<MunicipioCacheado[]>(this.CACHE_KEY);
    if (cached && cached.length > 0) {
      return cached;
    }
    if (!this.cacheandoEnProgreso) {
      await this.cachearMunicipiosGeoServer();
    } else {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return this.obtenerMunicipiosCacheados();
    }
    const data = await this.redisService.get<MunicipioCacheado[]>(this.CACHE_KEY);
    if (!data) {
      throw new InternalServerErrorException('Error al cachear municipios de GeoServer');
    }
    return data;
  }

  async encontrarDepartamento(datos: EncontrarDepartamento): Promise<MunicipioProvinciaDepartamento> {
    const municipiosCacheados = await this.obtenerMunicipiosCacheados();
    const punto = turf.point([datos.ubicacion.longitud, datos.ubicacion.latitud]);
    for (const municipio of municipiosCacheados) {
      if (turf.booleanPointInPolygon(punto, municipio.geometria)) {
        return {
          municipio: {
            id: municipio.properties.mun_id,
            municipio: municipio.properties.municipio,
          },
          provincia: {
            id: 0,
            provincia: municipio.properties.provincia,
          },
          departamento: {
            id: municipio.properties.departamento_id,
            departamento: municipio.properties.departamen,
          },
        };
      }
    }
    throw new NotFoundException(`No se encontró departamento para las coordenadas: latitud ${datos.ubicacion.latitud}, longitud ${datos.ubicacion.longitud}`);
  }

  async cachearMunicipiosGeoServer(): Promise<void> {
    if (this.cacheandoEnProgreso) {
      this.logger.log('Cacheo de municipios de GeoServer ya en progreso, omitiendo...');
      return;
    }

    this.cacheandoEnProgreso = true;
    this.logger.log('Iniciando cacheo de municipios de GeoServer en Redis...');
    try {
      const respuesta = await this.httpClientPublico.get<{
        features: { properties: unknown; geometry: unknown }[];
      }>(this.urlGeoserver, {
        params: {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: 'policia:Municipios',
          outputFormat: 'application/json',
        },
      });
      const municipiosCacheados = respuesta.features.map((feature) => ({
        properties: feature.properties,
        geometria: turf.feature(feature.geometry as GeoJSON.Geometry),
      }));
      await this.redisService.set(this.CACHE_KEY, municipiosCacheados);
      this.logger.log('Cacheo de municipios de GeoServer completado.');
    } catch (error) {
      const infoError = analizarErrorHttp(error);
      this.logger.error(`Error al cachear municipios de GeoServer en ${this.urlGeoserver}: ${infoError.mensaje}`);
      throw new InternalServerErrorException(infoError.mensaje);
    } finally {
      this.cacheandoEnProgreso = false;
    }
  }
}
