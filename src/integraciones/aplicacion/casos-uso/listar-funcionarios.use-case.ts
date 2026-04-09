import { Inject, Injectable } from '@nestjs/common';
import { ListarFuncionariosFiltros, PersonalPort } from '../../dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '../../dominio/tokens/integracion.tokens';
import { ListarFuncionariosResponseDto } from '../../presentacion/dto/funcionario.dto';

@Injectable()
export class ListarFuncionariosUseCase {
  constructor(
    @Inject(PERSONAL_TOKEN)
    private readonly funcionarioRepositorio: PersonalPort,
  ) {}

  async ejecutar(filtros: ListarFuncionariosFiltros): Promise<ListarFuncionariosResponseDto> {
    const resultado = await this.funcionarioRepositorio.listarFuncionarios(filtros);

    return {
      funcionarios: resultado.funcionarios,
      paginacion: {
        paginaActual: filtros.pagina,
        totalPaginas: Math.ceil(resultado.total / filtros.elementosPorPagina),
        totalElementos: resultado.total,
        elementosPorPagina: filtros.elementosPorPagina,
      },
    };
  }
}
