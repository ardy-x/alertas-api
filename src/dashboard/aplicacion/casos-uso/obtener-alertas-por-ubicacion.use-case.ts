import { Inject, Injectable } from '@nestjs/common';

import { AlertaPorMunicipio, DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';
import { ObtenerDepartamentosUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-departamentos.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { ObtenerProvinciasPorDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincias-por-departamento.use-case';

@Injectable()
export class ObtenerAlertasPorUbicacionUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
    readonly _obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
    readonly _obtenerProvinciasPorDepartamentoUseCase: ObtenerProvinciasPorDepartamentoUseCase,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar() {
    // Obtener alertas agrupadas por municipio
    const alertasPorMunicipio = await this.dashboardRepositorio.obtenerAlertasPorMunicipio();

    // Enriquecer con datos geográficos del módulo compartido
    const municipiosEnriquecidos = await Promise.all(
      alertasPorMunicipio.map(async (alerta: AlertaPorMunicipio) => {
        const datosGeograficos = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);

        if (datosGeograficos) {
          return {
            idMunicipio: alerta.idMunicipio,
            nombreMunicipio: datosGeograficos.municipio.municipio,
            nombreProvincia: datosGeograficos.provincia.provincia,
            nombreDepartamento: datosGeograficos.departamento.departamento,
            totalAlertas: alerta.totalAlertas,
            alertasActivas: alerta.alertasActivas,
          };
        } else {
          // Si no se encuentra el municipio, devolver con nombre genérico
          return {
            ...alerta,
            nombreMunicipio: `Municipio ${alerta.idMunicipio}`,
            nombreProvincia: 'Desconocida',
            nombreDepartamento: 'Desconocido',
          };
        }
      }),
    );

    // Agrupar por departamento
    const departamentosMap = new Map<string, { nombreDepartamento: string; totalAlertas: number; alertasActivas: number; alertasPendientes: number; alertasResueltas: number }>();
    municipiosEnriquecidos.forEach((municipio) => {
      const key = municipio.nombreDepartamento;
      if (!departamentosMap.has(key)) {
        departamentosMap.set(key, {
          nombreDepartamento: municipio.nombreDepartamento,
          totalAlertas: 0,
          alertasActivas: 0,
          alertasPendientes: 0,
          alertasResueltas: 0,
        });
      }
      const dept = departamentosMap.get(key)!;
      dept.totalAlertas += municipio.totalAlertas;
      dept.alertasActivas += municipio.alertasActivas;
    });

    // Agrupar por provincia
    const provinciasMap = new Map<string, { nombreProvincia: string; nombreDepartamento: string; totalAlertas: number; alertasActivas: number }>();
    municipiosEnriquecidos.forEach((municipio) => {
      const key = `${municipio.nombreProvincia}-${municipio.nombreDepartamento}`;
      if (!provinciasMap.has(key)) {
        provinciasMap.set(key, {
          nombreProvincia: municipio.nombreProvincia,
          nombreDepartamento: municipio.nombreDepartamento,
          totalAlertas: 0,
          alertasActivas: 0,
        });
      }
      const prov = provinciasMap.get(key)!;
      prov.totalAlertas += municipio.totalAlertas;
      prov.alertasActivas += municipio.alertasActivas;
    });

    return {
      departamentos: Array.from(departamentosMap.values()),
      provincias: Array.from(provinciasMap.values()),
      municipios: municipiosEnriquecidos,
    };
  }
}
