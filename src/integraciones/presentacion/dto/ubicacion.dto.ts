import { ApiProperty } from '@nestjs/swagger';

import { IsDateString, IsNumber, Max, Min } from 'class-validator';

// DTO para coordenadas simples (sin metadatos)
export class CoordenadaSimpleDto {
  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;
}

// DTO para ubicación simple con metadatos (coordenadas + precisión + timestamp)
export class UbicacionSimpleDto extends CoordenadaSimpleDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  precision: number;

  @ApiProperty()
  @IsDateString()
  marcaTiempo: string;
}
