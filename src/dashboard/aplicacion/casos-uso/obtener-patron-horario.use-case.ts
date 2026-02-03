import { Inject, Injectable } from '@nestjs/common';

import { IntensidadHoraria, PatronHorario } from '@/dashboard/dominio/entidades/patron-horario.entity';
import { DashboardRepositorioPort } from '@/dashboard/dominio/puertos/dashboard.port';
import { DASHBOARD_REPOSITORIO_TOKEN } from '@/dashboard/dominio/tokens/dashboard.tokens';

@Injectable()
export class ObtenerPatronHorarioUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORIO_TOKEN)
    private readonly dashboardRepositorio: DashboardRepositorioPort,
  ) {}

  async ejecutar(): Promise<PatronHorario> {
    const alertas = await this.dashboardRepositorio.obtenerAlertasConFechaHora();

    // Nombres de días en español
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

    // Crear matriz de intensidad (7 días x 24 horas)
    const intensidadMap = new Map<string, number>();

    alertas.forEach((alerta) => {
      const fecha = new Date(alerta.fechaHora);
      const diaSemana = diasSemana[fecha.getDay()];
      const hora = fecha.getHours();
      const clave = `${diaSemana}-${hora}`;

      intensidadMap.set(clave, (intensidadMap.get(clave) || 0) + 1);
    });

    // Convertir a array de datos para mapa de calor
    const datos: IntensidadHoraria[] = [];
    let maxCantidad = 0;
    let horaPico = { dia: '', hora: 0, cantidad: 0 };

    diasSemana.forEach((dia) => {
      for (let hora = 0; hora < 24; hora++) {
        const clave = `${dia}-${hora}`;
        const cantidad = intensidadMap.get(clave) || 0;

        datos.push({
          dia_semana: dia,
          hora,
          cantidad,
        });

        // Encontrar hora pico
        if (cantidad > maxCantidad) {
          maxCantidad = cantidad;
          horaPico = { dia, hora, cantidad };
        }
      }
    });

    return new PatronHorario(datos, alertas.length, horaPico);
  }
}
