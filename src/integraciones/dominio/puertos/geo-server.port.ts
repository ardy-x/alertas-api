import { MunicipioProvinciaDepartamento } from '../entidades/departamentos.entidad';

export interface EncontrarDepartamento {
  ubicacion: {
    latitud: number;
    longitud: number;
  };
}

export interface GeoServerPort {
  encontrarDepartamento(datos: EncontrarDepartamento): Promise<MunicipioProvinciaDepartamento>;
  cachearMunicipiosGeoServer(): Promise<void>;
}
