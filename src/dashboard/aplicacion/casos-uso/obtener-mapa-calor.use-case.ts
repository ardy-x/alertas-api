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

      // Solo incluir alertas que tengan ubicación
      if (!alerta.ubicacion) continue;

      // Usar las coordenadas reales de la base de datos
      const coordenadas = alerta.ubicacion.geometry.coordinates;

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordenadas,
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
