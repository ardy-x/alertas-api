import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';
import { ObtenerInvestigadorActivoUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/obtener-investigador-activo.use-case';
import { AlertaVictimaRepositorioPort } from '@/victimas/dominio/puertos/alerta-victima.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { EstadisticasAlertasService } from '@/victimas/dominio/servicios/estadisticas-alertas.service';
import { ALERTA_VICTIMA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { HistorialAlertasVictimaDto } from '@/victimas/presentacion/dto/salida/historial-alertas-victima.dto';

import { ObtenerHistorialAlertasParamsDto } from '../../../presentacion/dto/entrada/victima.dto';

@Injectable()
export class ObtenerHistorialAlertasVictimaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(ALERTA_VICTIMA_REPOSITORIO)
    private readonly alertaVictimaRepositorio: AlertaVictimaRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly estadisticasAlertasService: EstadisticasAlertasService,
    private readonly obtenerInvestigadorActivoUseCase: ObtenerInvestigadorActivoUseCase,
  ) {}

  async ejecutar(params: ObtenerHistorialAlertasParamsDto): Promise<HistorialAlertasVictimaDto> {
    if (!params.ci && !params.idVictima) {
      throw new Error('Debe proporcionar CI o ID de víctima');
    }

    let victima: { id: string } | null = null;
    if (params.ci) {
      victima = await this.victimaRepositorio.obtenerPorCedula(params.ci);
    } else if (params.idVictima) {
      victima = await this.victimaRepositorio.obtenerVictimaSimple(params.idVictima);
    }

    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    return this.procesarHistorial(victima.id);
  }

  private async procesarHistorial(idVictima: string): Promise<HistorialAlertasVictimaDto> {
    const datos = await this.alertaVictimaRepositorio.obtenerHistorialAlertas(idVictima);

    if (!datos) {
      throw new NotFoundException('Historial no encontrado');
    }

    // Calcular tiempos y estadísticas (lógica de negocio)
    const alertasConTiempos = this.estadisticasAlertasService.calcularTiemposPorAlerta(datos.alertas);
    const estadisticas = this.estadisticasAlertasService.calcularEstadisticas(datos.alertas, alertasConTiempos);

    // Enriquecer alertas con nombres geográficos
    const alertasEnriquecidas = await Promise.all(
      alertasConTiempos.map(async (alerta) => {
        if (alerta.idMunicipio) {
          const datosGeograficos = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(alerta.idMunicipio);
          if (datosGeograficos) {
            return {
              ...alerta,
              municipio: datosGeograficos.municipio.municipio,
              provincia: datosGeograficos.provincia.provincia,
              departamento: datosGeograficos.departamento.departamento,
            };
          } else {
            return {
              ...alerta,
              municipio: 'Desconocido',
              provincia: 'Desconocida',
              departamento: 'Desconocido',
            };
          }
        }

        return {
          ...alerta,
          municipio: 'Sin ubicación',
          provincia: 'Sin ubicación',
          departamento: 'Sin ubicación',
        };
      }),
    );

    // Obtener investigador activo
    const investigadorActivo = await this.obtenerInvestigadorActivoUseCase.ejecutar(idVictima);

    return {
      victima: datos.victima,
      estadisticas,
      alertas: alertasEnriquecidas,
      investigadorActivo,
    };
  }
}
