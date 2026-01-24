import { Inject, Injectable } from '@nestjs/common';

import { FuncionarioEntity } from '../../dominio/entidades/funcionario.entity';
import { PersonalPort } from '../../dominio/puertos/personal.port';
import { PERSONAL_TOKEN } from '../../dominio/tokens/integracion.tokens';

@Injectable()
export class ObtenerFuncionarioUseCase {
  constructor(
    @Inject(PERSONAL_TOKEN)
    private readonly funcionarioRepositorio: PersonalPort,
  ) {}

  async ejecutar(ci: string): Promise<FuncionarioEntity[]> {
    if (!ci || ci.trim().length === 0) {
      throw new Error('CI es requerido');
    }

    const funcionarios = await this.funcionarioRepositorio.buscarFuncionario(ci);

    if (!funcionarios || funcionarios.length === 0) {
      throw new Error('Funcionario no encontrado');
    }

    return funcionarios;
  }
}
