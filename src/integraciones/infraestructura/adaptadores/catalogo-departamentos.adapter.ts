import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { analizarErrorHttp } from '@/core/utilidades/http-error.util';
import { RedisService } from '@/redis/redis.service';

import { Departamento, Municipio, MunicipioProvinciaDepartamento, Provincia } from '../../dominio/entidades/departamentos.entidad';
import { DepartamentosPort } from '../../dominio/puertos/departamentos.port';

interface ApiResponse {
  error: boolean;
  message: string;
  response: {
    data: {
      id: number;
      nombre_departamento: string;
      abrev: string;
      codigo_integracion: number;
      provincias: {
        id: number;
        nombre_provincia: string;
        municipios: {
          id: number;
          nombre_municipio: string;
        }[];
      }[];
    }[];
  };
}

@Injectable()
export class CatalogoDepartamentosAdapter implements DepartamentosPort {
  private readonly logger = new Logger(CatalogoDepartamentosAdapter.name);
  private readonly CACHE_KEY = 'departamentos_completa';
  private readonly API_URL: string;
  private cachingPromise: Promise<void> | null = null;

  constructor(
    private readonly httpClientPublico: HttpClientPublicoService,
    private readonly redisService: RedisService,
  ) {
    this.API_URL = `${SERVICIOS_CONFIG.catalogosApiBase}/departamentos/simple`;
  }

  private async obtenerDatosDepartamentos(): Promise<ApiResponse['response']['data']> {
    let data = await this.redisService.get<ApiResponse['response']['data']>(this.CACHE_KEY);
    if (!data || !Array.isArray(data)) {
      await this.cachearDepartamentos();
      data = await this.redisService.get<ApiResponse['response']['data']>(this.CACHE_KEY);
      if (!data) {
        throw new InternalServerErrorException('Los datos de departamentos en cache son inválidos o faltantes');
      }
    }
    return data;
  }

  async obtenerDepartamentos(): Promise<Departamento[]> {
    const data = await this.obtenerDatosDepartamentos();

    return data.map((dept) => ({
      id: dept.id,
      departamento: dept.nombre_departamento,
    }));
  }

  async obtenerProvinciasPorDepartamento(idDepartamento: number): Promise<Provincia[]> {
    const data = await this.obtenerDatosDepartamentos();

    const departamento = data.find((dept) => dept.id === idDepartamento);
    if (!departamento) {
      throw new NotFoundException(`Departamento con ID ${idDepartamento} no encontrado`);
    }
    return departamento.provincias.map((prov) => ({
      id: prov.id,
      provincia: prov.nombre_provincia,
    }));
  }

  async obtenerMunicipiosPorProvincia(idProvincia: number): Promise<Municipio[]> {
    const data = await this.obtenerDatosDepartamentos();

    let municipios: Municipio[] = [];
    for (const dept of data) {
      for (const prov of dept.provincias) {
        if (prov.id === idProvincia) {
          municipios = prov.municipios.map((mun) => ({
            id: mun.id,
            municipio: mun.nombre_municipio,
          }));
          break;
        }
      }
      if (municipios.length > 0) break;
    }
    if (municipios.length === 0) {
      throw new NotFoundException(`Provincia con ID ${idProvincia} no encontrada`);
    }
    return municipios;
  }

  async obtenerProvinciaDepartamento(idMunicipio: number): Promise<MunicipioProvinciaDepartamento> {
    const data = await this.obtenerDatosDepartamentos();

    // Buscar el municipio en toda la jerarquía
    for (const dept of data) {
      for (const prov of dept.provincias) {
        for (const mun of prov.municipios) {
          if (mun.id === idMunicipio) {
            return {
              municipio: {
                id: mun.id,
                municipio: mun.nombre_municipio,
              },
              provincia: {
                id: prov.id,
                provincia: prov.nombre_provincia,
              },
              departamento: {
                id: dept.id,
                departamento: dept.nombre_departamento,
              },
            };
          }
        }
      }
    }

    throw new NotFoundException(`Municipio con ID ${idMunicipio} no encontrado`);
  }

  async cachearDepartamentos(): Promise<void> {
    if (this.cachingPromise) {
      return this.cachingPromise;
    }

    this.cachingPromise = (async () => {
      this.logger.log('Iniciando cacheo de departamentos en Redis...');
      try {
        const response = await this.httpClientPublico.get<ApiResponse>(this.API_URL);
        if (response.error) {
          throw new BadRequestException(`Error en la API de catálogos: ${response.message}`);
        }
        const data = response.response.data;
        await this.redisService.set(this.CACHE_KEY, data);
        this.logger.log('Cacheo de departamentos completado.');
      } catch (error) {
        const infoError = analizarErrorHttp(error);
        this.logger.error(`Error al cachear departamentos desde ${this.API_URL}: ${infoError.mensaje}`);
        if (infoError.esErrorCliente) {
          throw new BadRequestException(infoError.mensaje);
        } else {
          throw new InternalServerErrorException(infoError.mensaje);
        }
      }
    })();

    try {
      await this.cachingPromise;
    } finally {
      this.cachingPromise = null;
    }
  }
}
