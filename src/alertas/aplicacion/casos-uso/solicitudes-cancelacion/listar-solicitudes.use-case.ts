import { Inject, Injectable } from '@nestjs/common';

import { FiltrosSolicitudCancelacion, SolicitudCancelacionBasica } from '@/alertas/dominio/entidades/solicitud-cancelacion.entity';
import { SolicitudCancelacionRepositorioPort } from '@/alertas/dominio/puertos/solicitud-cancelacion.port';
import { SOLICITUD_CANCELACION_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerSolicitudesCancelacionRequestDto } from '@/alertas/presentacion/dto/entrada/solicitudes-cancelacion-entrada.dto';
import { ObtenerSolicitudesResponseDto } from '@/alertas/presentacion/dto/salida/solicitudes-cancelacion-salida.dto';
import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

@Injectable()
export class ListarSolicitudesUseCase {
  constructor(
    @Inject(SOLICITUD_CANCELACION_REPOSITORIO_TOKEN)
    private readonly solicitudCancelacionRepositorio: SolicitudCancelacionRepositorioPort,
    private readonly obtenerMunicipiosPorFiltroGeograficoUseCase: ObtenerMunicipiosPorFiltroGeograficoUseCase,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
  ) {}

  async ejecutar(filtros: ObtenerSolicitudesCancelacionRequestDto = { pagina: 1, elementosPorPagina: 10 }): Promise<ObtenerSolicitudesResponseDto> {
    // Preparar filtros para el repositorio
    const filtrosRepositorio: FiltrosSolicitudCancelacion = {
      pagina: filtros.pagina,
      elementosPorPagina: filtros.elementosPorPagina,
      estado: filtros.estado,
      busqueda: filtros.busqueda,
    };

    // Manejar filtros geográficos
    if (filtros.idDepartamento || filtros.idProvincia || filtros.idMunicipio) {
      const filtroGeografico = await this.obtenerMunicipiosPorFiltroGeograficoUseCase.ejecutar({
        idDepartamento: filtros.idDepartamento,
        idProvincia: filtros.idProvincia,
        idMunicipio: filtros.idMunicipio,
      });

      // Si hay municipios específicos, filtrar por ellos
      if (filtroGeografico.municipiosIds.length > 0) {
        filtrosRepositorio.municipiosIds = filtroGeografico.municipiosIds;
      }
    }

    // Manejar filtros de fechas si vienen
    if (filtros.fechaDesde) {
      filtrosRepositorio.fechaDesde = new Date(filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      filtrosRepositorio.fechaHasta = new Date(filtros.fechaHasta);
    }

    const listado = await this.solicitudCancelacionRepositorio.listarSolicitudes(filtrosRepositorio);

    // Enriquecer cada solicitud con nombres de municipio/provincia/departamento
    await Promise.all(
      listado.solicitudes.map(async (solicitud: SolicitudCancelacionBasica) => {
        const idMunicipio = solicitud.idMunicipio ?? null;
        if (idMunicipio) {
          const resultado = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(Number(idMunicipio));
          if (resultado) {
            solicitud.municipio = resultado.municipio.municipio;
            solicitud.provincia = resultado.provincia.provincia;
            solicitud.departamento = resultado.departamento.departamento;
          }
        }
      }),
    );

    const totalPaginas = Math.ceil(listado.total / filtros.elementosPorPagina);

    return {
      solicitudes: listado.solicitudes.map((solicitud) => ({
        ...solicitud,
        victima: solicitud.victima!,
      })),
      paginacion: {
        paginaActual: filtros.pagina,
        totalPaginas,
        totalElementos: listado.total,
        elementosPorPagina: filtros.elementosPorPagina,
      },
    };
  }
}
