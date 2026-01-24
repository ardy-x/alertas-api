import { RutaLineString } from '@/integraciones/dominio/entidades/ubicacion.types';

export interface RutaAlertaEntity {
  id: string;
  idAlerta: string;
  ruta: RutaLineString; // GeoJSON Feature LineString
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export interface CrearRutaAlertaDatos {
  id: string;
  idAlerta: string;
  ruta: RutaLineString;
}

export interface ActualizarRutaAlertaDatos {
  ruta: RutaLineString;
}
