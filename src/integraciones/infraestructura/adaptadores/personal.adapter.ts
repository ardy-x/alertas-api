import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import { HttpClientPublicoService } from '@/core/utilidades/http-client-publico.service';
import { FuncionarioEntity } from '../../dominio/entidades/funcionario.entity';
import { ListarFuncionariosDatos, ListarFuncionariosFiltros, PersonalPort } from '../../dominio/puertos/personal.port';

interface Funcionario {
  cedulaIdentidad?: string | null;
  grado?: string | null;
  escalafon?: string | null;
  nombreCompleto?: string | null;
  nombres?: string | null;
  paterno?: string | null;
  materno?: string | null;
  idUnidadPolicial?: number | null;
  unidadPolicial?: string | null;
  idCargo?: number | null;
  cargo?: string | null;
  estadoPersonal?: string | null;
  fotografia?: string | null;
}

interface RespuestaServicioPersonal<TResponse> {
  error: boolean;
  message: string;
  response: TResponse;
  status: number;
}

type BuscarFuncionarioResponse = {
  personalPolicial?: Funcionario | null;
};

type ListarFuncionariosResponse = {
  personalPolicial?: Funcionario[];
  paginacion?: {
    totalElementos: number;
  } | null;
};

@Injectable()
export class PersonalAdapter implements PersonalPort {
  private readonly logger = new Logger(PersonalAdapter.name);
  private readonly personalPolicialUrl: string;

  constructor(private readonly httpClientPublico: HttpClientPublicoService) {
    this.personalPolicialUrl = new URL('/api/personal-policial', SERVICIOS_CONFIG.personalApiBase).toString();
  }

  async buscarFuncionario(ci: string): Promise<FuncionarioEntity[] | null> {
    try {
      const data = await this.httpClientPublico.post<RespuestaServicioPersonal<BuscarFuncionarioResponse>>(
        this.personalPolicialUrl,
        {
          cedulaIdentidad: ci,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );
      return data.response?.personalPolicial ? [this.mapearFuncionario(data.response.personalPolicial)] : null;
    } catch (err: unknown) {
      this.logger.error(`Error al buscar funcionario en ${this.personalPolicialUrl}: ${err instanceof Error ? err.message : String(err)}`);
      throw new InternalServerErrorException('Error al buscar funcionario en servicio de Personal');
    }
  }

  async listarFuncionarios(filtros: ListarFuncionariosFiltros): Promise<ListarFuncionariosDatos> {
    const params = new URLSearchParams({
      pagina: String(filtros.pagina),
      elementosPorPagina: String(filtros.elementosPorPagina),
    });

    if (filtros.busqueda !== undefined && filtros.busqueda !== '') {
      params.set('busqueda', filtros.busqueda);
    }

    if (filtros.ordenarPor !== undefined && filtros.ordenarPor !== '') {
      params.set('ordenarPor', filtros.ordenarPor);
    }

    if (filtros.orden !== undefined) {
      params.set('orden', filtros.orden.toUpperCase());
    }

    if (filtros.idUnidad !== undefined) {
      params.set('idUnidad', String(filtros.idUnidad));
    }

    const url = `${this.personalPolicialUrl}?${params.toString()}`;

    try {
      const data = await this.httpClientPublico.get<RespuestaServicioPersonal<ListarFuncionariosResponse>>(url, {
        headers: {
          accept: 'application/json',
        },
      });

      const personal = data.response.personalPolicial ?? [];
      const total = data.response.paginacion?.totalElementos ?? 0;

      return {
        funcionarios: personal.map((func) => this.mapearFuncionario(func)),
        total,
      };
    } catch (err: unknown) {
      this.logger.error(`Error al listar funcionarios en ${url}: ${err instanceof Error ? err.message : String(err)}`);
      throw new InternalServerErrorException('Error al listar funcionarios en servicio de Personal');
    }
  }

  private mapearFuncionario(func: Funcionario): FuncionarioEntity {
    return {
      cedulaIdentidad: func.cedulaIdentidad ?? '',
      nroEscalafon: func.escalafon ?? '',
      grado: func.grado ?? '',
      nombreCompleto: func.nombreCompleto || `${func.nombres || ''} ${func.paterno || ''} ${func.materno || ''}`,
      unidad: func.unidadPolicial ?? '',
      cargo: func.cargo ?? '',
      procesoDisciplinario: false,
    };
  }
}
