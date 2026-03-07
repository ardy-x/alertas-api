import { Inject, Injectable } from '@nestjs/common';

import { AlertaPorMunicipio, DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';
import { ObtenerDepartamentosUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-departamentos.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

@Injectable()
export class ObtenerAlertasPorUbicacionUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
    readonly _obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar() {
    // Obtener todos los departamentos y alertas en paralelo
    const [todosDepartamentos, alertasPorMunicipio] = await Promise.all([this._obtenerDepartamentosUseCase.ejecutar(), this.dashboardRepositorio.obtenerAlertasPorMunicipio()]);

    // Enriquecer alertas con nombre de departamento
    const alertasConDepartamento = await Promise.all(
      alertasPorMunicipio.map(async (alerta: AlertaPorMunicipio) => {
        const datosGeograficos = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);
        return {
          nombreDepartamento: datosGeograficos?.departamento.departamento ?? 'Desconocido',
          totalAlertas: alerta.totalAlertas,
          alertasActivas: alerta.alertasActivas,
          alertasCerradas: alerta.alertasCerradas,
        };
      }),
    );

    // Agrupar por departamento
    const alertasMap = new Map<string, { totalAlertas: number; alertasActivas: number; alertasCerradas: number }>();
    alertasConDepartamento.forEach((item) => {
      const key = item.nombreDepartamento;
      if (!alertasMap.has(key)) {
        alertasMap.set(key, { totalAlertas: 0, alertasActivas: 0, alertasCerradas: 0 });
      }
      const stats = alertasMap.get(key)!;
      stats.totalAlertas += item.totalAlertas;
      stats.alertasActivas += item.alertasActivas;
      stats.alertasCerradas += item.alertasCerradas;
    });

    // Devolver TODOS los departamentos, con 0 si no tienen alertas
    return todosDepartamentos.map((dept) => {
      const stats = alertasMap.get(dept.departamento) ?? { totalAlertas: 0, alertasActivas: 0, alertasCerradas: 0 };
      return {
        nombreDepartamento: dept.departamento,
        totalAlertas: stats.totalAlertas,
        alertasActivas: stats.alertasActivas,
        alertasCerradas: stats.alertasCerradas,
      };
    });
  }
}
