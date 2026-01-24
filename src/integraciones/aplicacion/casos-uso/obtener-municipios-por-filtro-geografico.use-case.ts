import { Injectable } from '@nestjs/common';

import { ObtenerMunicipiosPorProvinciaUseCase } from './obtener-municipios-por-provincia.use-case';
import { ObtenerProvinciasPorDepartamentoUseCase } from './obtener-provincias-por-departamento.use-case';

export interface FiltroGeograficoRequest {
  idDepartamento?: number;
  idProvincia?: number;
  idMunicipio?: number;
}

export interface FiltroGeograficoResponse {
  municipiosIds: number[];
}

@Injectable()
export class ObtenerMunicipiosPorFiltroGeograficoUseCase {
  constructor(
    private readonly obtenerProvinciasPorDepartamentoUseCase: ObtenerProvinciasPorDepartamentoUseCase,
    private readonly obtenerMunicipiosPorProvinciaUseCase: ObtenerMunicipiosPorProvinciaUseCase,
  ) {}

  async ejecutar(filtro: FiltroGeograficoRequest): Promise<FiltroGeograficoResponse> {
    const municipiosIds: number[] = [];

    // Si especifica municipio directamente, usar solo ese
    if (filtro.idMunicipio) {
      municipiosIds.push(filtro.idMunicipio);
    }
    // Si especifica provincia, obtener todos los municipios de esa provincia
    else if (filtro.idProvincia) {
      const municipios = await this.obtenerMunicipiosPorProvinciaUseCase.ejecutar(filtro.idProvincia);
      municipiosIds.push(...municipios.map((m) => m.id));
    }
    // Si especifica departamento, obtener todos los municipios de todas las provincias de ese departamento
    else if (filtro.idDepartamento) {
      const provincias = await this.obtenerProvinciasPorDepartamentoUseCase.ejecutar(filtro.idDepartamento);

      for (const provincia of provincias) {
        const municipios = await this.obtenerMunicipiosPorProvinciaUseCase.ejecutar(provincia.id);
        municipiosIds.push(...municipios.map((m) => m.id));
      }
    }

    return { municipiosIds };
  }
}
