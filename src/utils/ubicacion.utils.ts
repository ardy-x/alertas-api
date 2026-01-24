import { UbicacionPoint } from '../integraciones/dominio/entidades/ubicacion.types';

/**
 * Convierte una ubicación simple a formato GeoJSON Point
 */
export function convertirAUbicacionGeoJSON(ubicacion: { latitud: number; longitud: number; precision?: number; marcaTiempo?: string }): UbicacionPoint {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [ubicacion.longitud, ubicacion.latitud],
    },
    properties: {
      accuracy: ubicacion.precision || 0,
      timestamp: ubicacion.marcaTiempo || new Date().toISOString(),
    },
  };
}

/**
 * Transforma una ubicación simple a UbicacionPoint (alias para compatibilidad)
 */
export function transformarUbicacionSimpleAUbicacionPoint(
  ubicacionSimple:
    | {
        latitud: number;
        longitud: number;
        precision?: number;
        marcaTiempo?: string;
      }
    | null
    | undefined,
): UbicacionPoint | null {
  if (!ubicacionSimple) return null;
  return convertirAUbicacionGeoJSON(ubicacionSimple);
}
