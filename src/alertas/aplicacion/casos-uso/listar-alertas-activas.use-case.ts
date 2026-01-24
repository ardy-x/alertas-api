import { Inject, Injectable, Logger } from '@nestjs/common';

import { AlertaWebRepositorioPort } from '@/alertas/dominio/puertos/alerta-web.port';
import { DatosExternosAttRepositorioPort } from '@/alertas/dominio/puertos/datos-externos-att.port';
import { ALERTA_WEB_REPOSITORIO_TOKEN, DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { ObtenerProvinciaDepartamentoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-provincia-departamento.use-case';

import { AlertaActiva, FiltrosAlertasActivas } from '../../dominio/entidades/alerta.entity';
import { OrigenAlerta } from '../../dominio/enums/alerta-enums';
import { FiltrosAlertasActivasRequestDto } from '../../presentacion/dto/entrada/alertas-entrada.dto';
import { ObtenerAlertasActivasResponseDto } from '../../presentacion/dto/salida/alertas-salida.dto';

@Injectable()
export class ListarAlertasActivasUseCase {
  private readonly logger = new Logger(ListarAlertasActivasUseCase.name);

  constructor(
    @Inject(ALERTA_WEB_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaWebRepositorioPort,
    @Inject(DATOS_EXTERNOS_ATT_REPOSITORIO_TOKEN)
    private readonly datosExternosAttRepo: DatosExternosAttRepositorioPort,
    private readonly obtenerProvinciaDepartamentoUseCase: ObtenerProvinciaDepartamentoUseCase,
    private readonly obtenerMunicipiosPorFiltroGeograficoUseCase: ObtenerMunicipiosPorFiltroGeograficoUseCase,
  ) {}

  async ejecutar(filtros?: FiltrosAlertasActivasRequestDto): Promise<ObtenerAlertasActivasResponseDto> {
    const filtrosRepositorio: FiltrosAlertasActivas = {};

    // Manejar filtros geográficos si están presentes
    if (filtros && (filtros.idDepartamento || filtros.idProvincia || filtros.idMunicipio)) {
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

    // Obtener todas las alertas activas (estados: PENDIENTE, ASIGNADA, EN_ATENCION) con filtros
    const alertasActivas = await this.alertaRepositorio.listarAlertasActivas(filtrosRepositorio);

    // Enriquecer alertas con datos de víctima desde ATT si no tienen idVictima
    await Promise.all(
      alertasActivas.map(async (alerta: AlertaActiva) => {
        // Si no tiene víctima pero es de origen ATT, obtener datos externos
        if (!alerta.victima && String(alerta.origen) === String(OrigenAlerta.ATT)) {
          try {
            const datosExternos = await this.datosExternosAttRepo.obtenerAlertaATT(alerta.id);
            if (datosExternos) {
              // Formatear como víctima normal
              alerta.victima = {
                id: '',
                cedulaIdentidad: datosExternos.persona?.cedulaIdentidad || '',
                nombreCompleto: `${datosExternos.persona?.nombres || ''} ${datosExternos.persona?.apellidos || ''}`.trim() || 'Sin nombre',
                celular: datosExternos.contacto?.celular || '',
              };
            }
          } catch (error) {
            this.logger.warn(`No se pudieron obtener datos externos para alerta ${alerta.id}:`, error);
          }
        }

        // Enriquecer con nombres planos de municipio/provincia/departamento
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

    return {
      alertas: alertasActivas,
    };
  }
}
