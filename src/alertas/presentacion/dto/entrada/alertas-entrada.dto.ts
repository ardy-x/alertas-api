import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';
import { UbicacionSimpleDto } from '@/integraciones/presentacion/dto/ubicacion.dto';

export class CrearAlertaRequestDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  @IsUUID('4')
  idVictima: string;

  @ApiProperty({ example: '2026-01-24T12:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  fechaHora: string;

  @ApiPropertyOptional({ example: 'DEN-001' })
  @IsOptional()
  @IsString()
  codigoDenuncia?: string;

  @ApiPropertyOptional({ example: 'REG-001' })
  @IsOptional()
  @IsString()
  codigoRegistro?: string;

  @ApiPropertyOptional({
    example: {
      latitud: -16.5,
      longitud: -68.15,
      precision: 10,
      marcaTiempo: '2023-10-01T12:00:00.000Z',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UbicacionSimpleDto)
  ubicacion?: UbicacionSimpleDto;
}

export class ActualizarAlertaRequestDto {
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => UbicacionSimpleDto)
  ubicacion: UbicacionSimpleDto;
}

export class AlertasPaginacionQueryDto extends PaginacionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsEnum(['FELCV', 'ATT'], { each: true })
  origen?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  @IsArray()
  @IsEnum(['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'], { each: true })
  estadoAlerta?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idDepartamento?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idProvincia?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idMunicipio?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}

export class FiltrosAlertasActivasRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idDepartamento?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idProvincia?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idMunicipio?: number;
}
