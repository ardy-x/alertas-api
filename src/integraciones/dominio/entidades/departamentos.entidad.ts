export interface Departamento {
  id: number;
  departamento: string;
}

export interface Provincia {
  id: number;
  provincia: string;
}

export interface Municipio {
  id: number;
  municipio: string;
}

export interface MunicipioProvinciaDepartamento {
  municipio: Municipio;
  provincia: Provincia;
  departamento: Departamento;
}
