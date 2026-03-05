import { Inject, Injectable, Logger } from '@nestjs/common';

import { AlertaWebRepositorioPort } from '@/alertas/dominio/puertos/alerta-web.port';
import { DatosExternosAttRepositorioPort } from '@/alertas/dominio/puertos/datos-externos-att.port';
import { ALERTA_WEB_REPOSITORIO_TOKEN, DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

import { AlertaHistorial, FiltrosAlerta } from '../../dominio/entidades/alerta.entity';
import { EstadoAlerta, OrigenAlerta } from '../../dominio/enums/alerta-enums';
import { AlertasPaginacionQueryDto } from '../../presentacion/dto/entrada/alertas-entrada.dto';
import { ObtenerHistorialAlertasResponseDto } from '../../presentacion/dto/salida/alertas-salida.dto';

@Injectable()
export class ListarHistorialAlertasUseCase {
  private readonly logger = new Logger(ListarHistorialAlertasUseCase.name);

  constructor(
    @Inject(ALERTA_WEB_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaWebRepositorioPort,
    @Inject(DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN)
    private readonly datosExternosAttRepo: DatosExternosAttRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly obtenerMunicipiosPorFiltroGeograficoUseCase: ObtenerMunicipiosPorFiltroGeograficoUseCase,
  ) {}

  async ejecutar(entrada: AlertasPaginacionQueryDto = { pagina: 1, elementosPorPagina: 10 }): Promise<ObtenerHistorialAlertasResponseDto> {
    const pagina = entrada.pagina;
    const elementosPorPagina = entrada.elementosPorPagina;

    // Preparar filtros para el adaptador
    const filtrosAdaptador: FiltrosAlerta = {
      pagina,
      elementosPorPagina,
      busqueda: entrada.busqueda,
    };

    // Agregar filtros adicionales si están presentes
    if (entrada.origen) filtrosAdaptador.origen = entrada.origen as OrigenAlerta[];
    if (entrada.estadoAlerta) filtrosAdaptador.estadoAlerta = entrada.estadoAlerta as EstadoAlerta[];
    if (entrada.fechaDesde) filtrosAdaptador.fechaDesde = new Date(entrada.fechaDesde);
    if (entrada.fechaHasta) filtrosAdaptador.fechaHasta = new Date(entrada.fechaHasta);

    // Manejar filtros geográficos usando el nuevo caso de uso
    if (entrada.idDepartamento || entrada.idProvincia || entrada.idMunicipio) {
      const filtroGeografico = await this.obtenerMunicipiosPorFiltroGeograficoUseCase.ejecutar({
        idDepartamento: entrada.idDepartamento,
        idProvincia: entrada.idProvincia,
        idMunicipio: entrada.idMunicipio,
      });

      // Si hay municipios específicos, filtrar por ellos
      if (filtroGeografico.municipiosIds.length > 0) {
        filtrosAdaptador.municipiosIds = filtroGeografico.municipiosIds;
      }
    }

    const historial = await this.alertaRepositorio.listarAlertaHistorial(filtrosAdaptador);

    // Enriquecer cada alerta con nombres planos de municipio/provincia/departamento
    await Promise.all(
      historial.alertas.map(async (alerta: AlertaHistorial) => {
        // Si no hay víctima pero es de origen ATT, obtener datos externos
        if (!alerta.victima && String(alerta.origen) === String(OrigenAlerta.ATT)) {
          try {
            const datosExternos = await this.datosExternosAttRepo.obtenerAlertaATT(alerta.id);
            if (datosExternos) {
              // Formatear como víctima en el formato del historial
              alerta.victima = {
                cedulaIdentidad: datosExternos.persona?.cedulaIdentidad || '',
                nombreCompleto: `${datosExternos.persona?.nombres || 'Sin nombre'} ${datosExternos.persona?.apellidos || ''}`.trim(),
                celular: datosExternos.contacto?.celular || '',
                correo: datosExternos.contacto?.correo || undefined,
              };
            }
          } catch (error) {
            this.logger.warn(`No se pudieron obtener datos externos para alerta ${alerta.id}:`, error);
          }
        }

        // Enriquecer con municipio
        const idMunicipio = alerta.idMunicipio ?? null;
        if (idMunicipio) {
          const resultado = await this.obtenerProvinciaDepartamentoUseCase.ejecutar(Number(idMunicipio));
          if (resultado) {
            alerta.municipio = resultado.municipio.municipio;
            alerta.provincia = resultado.provincia.provincia;
            alerta.departamento = resultado.departamento.departamento;
          }
        }
      }),
    );

    const totalElementos = historial.total;

    return {
      historial: historial.alertas,
      paginacion: {
        paginaActual: pagina,
        totalPaginas: Math.ceil(totalElementos / elementosPorPagina),
        totalElementos,
        elementosPorPagina: elementosPorPagina,
      },
    };
  }
}
