import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';
import { UbicacionSimpleDto } from '@/integraciones/presentacion/dto/ubicacion.dto';

// DTOs de entrada para solicitudes de cancelación
export class CrearSolicitudCancelacionRequestDto {
  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fechaSolicitud: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UbicacionSimpleDto)
  ubicacion?: UbicacionSimpleDto;
}

export class ProcesarSolicitudCancelacionRequestDto {
  @ApiProperty({ enum: EstadoSolicitudCancelacion })
  @IsEnum(EstadoSolicitudCancelacion)
  @IsNotEmpty()
  estadoSolicitud: EstadoSolicitudCancelacion;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  motivoCancelacion: string;
}

export class ObtenerSolicitudesCancelacionRequestDto extends PaginacionQueryDto {
  @ApiPropertyOptional({ isArray: true, enum: EstadoSolicitudCancelacion })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return undefined;
  })
  @IsEnum(EstadoSolicitudCancelacion, { each: true })
  estado?: EstadoSolicitudCancelacion[];

  @ApiProperty({ default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsNumber({})
  @Min(1)
  @Max(100)
  elementosPorPagina: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({})
  idDepartamento?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({})
  idProvincia?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({})
  idMunicipio?: number;
}
