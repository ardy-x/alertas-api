import { FuncionarioEntity } from '../entidades/funcionario.entity';

export interface PersonalPort {
  buscarFuncionario(ci: string): Promise<FuncionarioEntity[] | null>;
}
