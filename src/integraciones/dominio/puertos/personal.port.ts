import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';
import { FuncionarioEntity } from '../entidades/funcionario.entity';

export interface ListarFuncionariosFiltros extends PaginacionQuery {
  busqueda?: string;
  idUnidad?: number;
}

export interface ListarFuncionariosDatos {
  funcionarios: FuncionarioEntity[];
  total: number;
}

export interface PersonalPort {
  buscarFuncionario(ci: string): Promise<FuncionarioEntity[] | null>;
  listarFuncionarios(filtros: ListarFuncionariosFiltros): Promise<ListarFuncionariosDatos>;
}
