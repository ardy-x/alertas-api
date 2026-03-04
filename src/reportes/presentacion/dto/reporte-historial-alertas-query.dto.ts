import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNumber } from 'class-validator';

export class ReporteHistorialAlertasQueryDto {
  @ApiProperty({ description: 'Filtrar por departamento' })
  @Type(() => Number)
  @IsNumber()
  declare idDepartamento: number;

  @ApiProperty({ description: 'Fecha inicio (ISO 8601)', example: '2026-01-01' })
  @IsDateString()
  declare fechaDesde: string;

  @ApiProperty({ description: 'Fecha fin (ISO 8601)', example: '2026-01-31' })
  @IsDateString()
  declare fechaHasta: string;

  @ApiProperty({ enum: ['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'] })
  @IsEnum(['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'])
  declare estadoAlerta: string;

  @ApiProperty({ description: 'Límite de registros a incluir en el reporte' })
  @Type(() => Number)
  @IsNumber()
  declare elementosPorPagina: number;
}
