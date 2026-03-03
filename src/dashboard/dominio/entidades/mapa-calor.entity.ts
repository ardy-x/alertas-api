// GeoJSON para MapLibre/Mapbox - Cada feature es una alerta individual
export interface AlertaGeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id_alerta: string;
    estado: string; // Para colorear en el mapa
    fecha_hora: string;
    origen: string;
  };
}

export class MapaCalorGeoJSON {
  type: 'FeatureCollection';
  features: AlertaGeoJSONFeature[];

  constructor(features: AlertaGeoJSONFeature[]) {
    this.type = 'FeatureCollection';
    this.features = features;
  }
}
