/**
 * Interfaces para ubicaciones GeoJSON Feature según estándar actualizado
 */

// Para ubicaciones puntuales (Alerta, Evento, AtencionFuncionario)
export interface UbicacionPoint {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    accuracy: number; // metros de precisión
    timestamp: string; // ISO 8601
  };
}

// Para rutas de seguimiento (RutaAlerta, RutaFuncionario)
export interface RutaLineString {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // Array de [longitude, latitude]
  };
}

// Validadores de GeoJSON Feature
export const validarUbicacionPoint = (ubicacion: unknown): ubicacion is UbicacionPoint => {
  if (!ubicacion || typeof ubicacion !== 'object') return false;
  const obj = ubicacion as Record<string, unknown>;
  const geometry = obj.geometry as Record<string, unknown> | null | undefined;
  const properties = obj.properties as Record<string, unknown> | null | undefined;

  if (!geometry || typeof geometry !== 'object') return false;
  if (!properties || typeof properties !== 'object') return false;

  const coordinates = geometry.coordinates as unknown[] | undefined;

  return (
    obj.type === 'Feature' &&
    geometry.type === 'Point' &&
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number' &&
    typeof properties.accuracy === 'number' &&
    typeof properties.timestamp === 'string'
  );
};

export const validarRutaLineString = (ruta: unknown): ruta is RutaLineString => {
  if (!ruta || typeof ruta !== 'object') return false;
  const obj = ruta as Record<string, unknown>;
  const geometry = obj.geometry as Record<string, unknown> | null | undefined;

  if (!geometry || typeof geometry !== 'object') return false;
  const coordinates = geometry.coordinates as unknown[] | undefined;

  return (
    obj.type === 'Feature' &&
    geometry.type === 'LineString' &&
    Array.isArray(coordinates) &&
    coordinates.every((coord: unknown) => Array.isArray(coord) && coord.length === 2 && typeof coord[0] === 'number' && typeof coord[1] === 'number')
  );
};
