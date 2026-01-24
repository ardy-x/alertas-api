import { Departamento, Municipio, MunicipioProvinciaDepartamento, Provincia } from '../entidades/departamentos.entidad';

export interface DepartamentosPort {
  obtenerDepartamentos(): Promise<Departamento[]>;
  obtenerProvinciasPorDepartamento(idDepartamento: number): Promise<Provincia[]>;
  obtenerMunicipiosPorProvincia(idProvincia: number): Promise<Municipio[]>;
  obtenerProvinciaDepartamento(idMunicipio: number): Promise<MunicipioProvinciaDepartamento>;
  cachearDepartamentos(): Promise<void>;
}
