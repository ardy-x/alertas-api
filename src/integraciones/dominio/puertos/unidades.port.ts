import { Unidad } from '../entidades/unidades.entidad';

export interface UnidadesPort {
  obtenerUnidadesCercanas(latitud: number, longitud: number): Promise<Unidad[]>;
}
