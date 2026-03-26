import { ApiProperty } from '@nestjs/swagger';

// DTO para respuesta GeoJSON del mapa de calor
export class GeoJSONGeometryDto {
  @ApiProperty({ example: 'Point', description: 'Tipo de geometría GeoJSON' })
  declare type: 'Point';

  @ApiProperty({ example: [-68.1193, -16.4897], description: 'Coordenadas [longitud, latitud]', type: [Number] })
  declare coordinates: [number, number];
}

export class AlertaGeoJSONPropertiesDto {
  @ApiProperty({ example: 'uuid-1234-5678', description: 'ID de la alerta' })
  declare id_alerta: string;

  @ApiProperty({ example: 'ACTIVA', description: 'Estado de la alerta' })
  declare estado: string;

  @ApiProperty({ example: '2026-03-08T10:30:00.000Z', description: 'Fecha y hora de la alerta' })
  declare fecha_hora: string;

  @ApiProperty({ example: 'APP_MOVIL', description: 'Origen de la alerta' })
  declare origen: string;
}

export class AlertaGeoJSONFeatureDto {
  @ApiProperty({ example: 'Feature', description: 'Tipo de elemento GeoJSON' })
  declare type: 'Feature';

  @ApiProperty({ type: GeoJSONGeometryDto, description: 'Geometría del punto de la alerta' })
  declare geometry: GeoJSONGeometryDto;

  @ApiProperty({ type: AlertaGeoJSONPropertiesDto, description: 'Propiedades de la alerta' })
  declare properties: AlertaGeoJSONPropertiesDto;
}

export class MapaCalorGeoJSONDto {
  @ApiProperty({ example: 'FeatureCollection', description: 'Tipo de colección GeoJSON' })
  declare type: 'FeatureCollection';

  @ApiProperty({ type: [AlertaGeoJSONFeatureDto], description: 'Colección de alertas en formato GeoJSON' })
  declare features: AlertaGeoJSONFeatureDto[];
}
