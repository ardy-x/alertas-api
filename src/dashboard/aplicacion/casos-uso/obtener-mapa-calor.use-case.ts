import { Inject, Injectable } from '@nestjs/common';

import { AlertaGeoJSONFeature, MapaCalorGeoJSON } from '@/dashboard/dominio/entidades/mapa-calor.entity';
import { DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

@Injectable()
export class ObtenerMapaCalorUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(idDepartamento?: number, idProvincia?: number, idMunicipio?: number): Promise<MapaCalorGeoJSON> {
    // Obtener TODAS las alertas individuales
    const alertas = await this.dashboardRepositorio.obtenerTodasLasAlertas();

    const features: AlertaGeoJSONFeature[] = [];

    // Coordenadas simuladas (en producción obtener de GeoServer/Catálogos)
    const generarCoordenadas = (): [number, number] => {
      return [
        -68.1 + (Math.random() - 0.5) * 15, // lng
        -16.5 + (Math.random() - 0.5) * 12, // lat
      ];
    };

    for (const alerta of alertas) {
      // Aplicar filtros jerárquicos si tienen municipio
      if (alerta.idMunicipio) {
        const datosGeo = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);

        if (datosGeo) {
          if (idMunicipio && alerta.idMunicipio !== idMunicipio) continue;
          if (idProvincia && datosGeo.provincia.id !== idProvincia) continue;
          if (idDepartamento && datosGeo.departamento.id !== idDepartamento) continue;
        }
      }

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: generarCoordenadas(),
        },
        properties: {
          id_alerta: alerta.id,
          estado: alerta.estado,
          fecha_hora: alerta.fechaHora.toISOString(),
          origen: alerta.origen,
        },
      });
    }

    return new MapaCalorGeoJSON(features);
  }
}
