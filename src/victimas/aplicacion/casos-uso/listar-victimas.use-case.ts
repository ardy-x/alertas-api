import { Inject, Injectable } from '@nestjs/common';

import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { AlertaVictimaRepositorioPort } from '@/victimas/dominio/puertos/alerta-victima.port';
import { FiltrosVictima } from '@/victimas/dominio/puertos/victima.port';
import { ALERTA_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { ListarVictimasRequestDto } from '../../presentacion/dto/entrada/victima.dto';
import { ListarVictimasData, VictimaBaseResponseDto } from '../../presentacion/dto/salida/victima.dto';

@Injectable()
export class ListarVictimasUseCase {
  constructor(
    @Inject(ALERTA_VICTIMA_REPOSITORIO)
    private readonly alertaVictimaRepositorio: AlertaVictimaRepositorioPort,
    private readonly obtenerMunicipiosPorFiltroGeograficoUseCase: ObtenerMunicipiosPorFiltroGeograficoUseCase,
  ) {}

  async ejecutar(entrada: ListarVictimasRequestDto = { pagina: 1, elementosPorPagina: 10 }): Promise<ListarVictimasData> {
    // Preparar filtros para el repositorio
    const filtros: FiltrosVictima = {
      pagina: entrada.pagina,
      elementosPorPagina: entrada.elementosPorPagina,
      busqueda: entrada?.busqueda,
      estadoCuenta: entrada?.estadoCuenta,
    };

    // Manejar filtros geográficos
    if (entrada.idDepartamento || entrada.idProvincia || entrada.idMunicipio) {
      const filtroGeografico = await this.obtenerMunicipiosPorFiltroGeograficoUseCase.ejecutar({
        idDepartamento: entrada.idDepartamento,
        idProvincia: entrada.idProvincia,
        idMunicipio: entrada.idMunicipio,
      });

      // Si hay municipios específicos, filtrar por ellos
      if (filtroGeografico.municipiosIds.length > 0) {
        filtros.municipiosIds = filtroGeografico.municipiosIds;
      }
    }

    const listado = await this.alertaVictimaRepositorio.listarVictimas(filtros);

    const victimas = listado.victimas.map(
      (victima): VictimaBaseResponseDto => ({
        id: victima.id,
        cedulaIdentidad: victima.cedulaIdentidad,
        nombreCompleto: victima.nombreCompleto,
        celular: victima.celular,
        correo: victima.correo || undefined,
        estadoCuenta: victima.estadoCuenta,
        creadoEn: victima.creadoEn || new Date(),
        ultimaConexion: victima.ultimaConexion || undefined,
        permisosApp: victima.permisosApp || undefined,
      }),
    );

    const totalElementos = listado.total;

    return {
      victimas,
      paginacion: {
        paginaActual: entrada.pagina,
        totalPaginas: Math.ceil(totalElementos / entrada.elementosPorPagina),
        totalElementos,
        elementosPorPagina: entrada.elementosPorPagina,
      },
    };
  }
}
