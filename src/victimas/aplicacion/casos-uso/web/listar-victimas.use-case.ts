import { Inject, Injectable } from '@nestjs/common';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { ObtenerMunicipiosPorFiltroGeograficoUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-municipios-por-filtro-geografico.use-case';
import { AlertaVictimaRepositorioPort } from '@/victimas/dominio/puertos/alerta-victima.port';
import { InvestigadorVictimaRepositorioPort } from '@/victimas/dominio/puertos/investigador-victima.port';
import { FiltrosVictima } from '@/victimas/dominio/puertos/victima.port';
import { ALERTA_VICTIMA_REPOSITORIO, INVESTIGADOR_VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { ListarVictimasRequestDto } from '../../../presentacion/dto/entrada/victima.dto';
import { ListarVictimasData, VictimaBaseResponseDto } from '../../../presentacion/dto/salida/victima.dto';

@Injectable()
export class ListarVictimasUseCase {
  constructor(
    @Inject(ALERTA_VICTIMA_REPOSITORIO)
    private readonly alertaVictimaRepositorio: AlertaVictimaRepositorioPort,
    @Inject(INVESTIGADOR_VICTIMA_REPOSITORIO)
    private readonly investigadorRepositorio: InvestigadorVictimaRepositorioPort,
    private readonly obtenerMunicipiosPorFiltroGeograficoUseCase: ObtenerMunicipiosPorFiltroGeograficoUseCase,
  ) {}

  async ejecutar(entrada: ListarVictimasRequestDto = { pagina: 1, elementosPorPagina: 10 }, idUsuario?: string, rolUsuario?: string): Promise<ListarVictimasData> {
    // Preparar filtros para el repositorio
    const filtros: FiltrosVictima = {
      pagina: entrada.pagina,
      elementosPorPagina: entrada.elementosPorPagina,
    };

    // Si el usuario es INVESTIGADOR, solo mostrar sus víctimas asignadas
    if (rolUsuario === RolesPermitidos.INVESTIGADOR && idUsuario) {
      const victimasIds = await this.investigadorRepositorio.obtenerVictimasIdsPorInvestigador(idUsuario);
      if (victimasIds.length === 0) {
        // Si no tiene víctimas asignadas, devolver lista vacía
        return {
          victimas: [],
          paginacion: {
            paginaActual: entrada.pagina,
            totalPaginas: 0,
            totalElementos: 0,
            elementosPorPagina: entrada.elementosPorPagina,
          },
        };
      }
      filtros.victimasIds = victimasIds;
    }

    // Agregar filtros opcionales si están presentes
    if (entrada.busqueda) filtros.busqueda = entrada.busqueda;
    if (entrada.estadoCuenta) filtros.estadoCuenta = entrada.estadoCuenta;
    if (entrada.ordenarPor) filtros.ordenarPor = entrada.ordenarPor;
    if (entrada.orden) filtros.orden = entrada.orden.toLowerCase() as 'asc' | 'desc';

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

    // Verificar investigador activo para cada víctima (solo existencia, sin datos completos)
    const victimas = await Promise.all(
      listado.victimas.map(async (victima): Promise<VictimaBaseResponseDto> => {
        const tieneInvestigadorActivo = await this.investigadorRepositorio.tieneInvestigadorActivo(victima.id);

        return {
          id: victima.id,
          cedulaIdentidad: victima.cedulaIdentidad,
          nombreCompleto: victima.nombreCompleto,
          celular: victima.celular,
          correo: victima.correo || undefined,
          estadoCuenta: victima.estadoCuenta,
          creadoEn: victima.creadoEn || new Date(),
          ultimaConexion: victima.ultimaConexion || undefined,
          permisosApp: victima.permisosApp || undefined,
          tieneInvestigadorActivo,
        };
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
