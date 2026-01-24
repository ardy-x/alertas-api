import { AgregarFuncionarioDatos, AtencionFuncionarioEntity, CrearAtencionFuncionarioDatos } from '../entidades/atencion-funcionario.entity';

export { CrearAtencionFuncionarioDatos, AgregarFuncionarioDatos };

export interface AtencionPersonalPort {
  agregarFuncionario(datos: AgregarFuncionarioDatos): Promise<void>;
  obtenerPorAtencion(idAtencion: string): Promise<AtencionFuncionarioEntity[]>;
}
