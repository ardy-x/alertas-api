import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MotivoCierre } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class AgresorCierreDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cedulaIdentidad: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentesco?: string;
}

export class CerrarAlertaRequestDto {
  @ApiProperty({ enum: MotivoCierre })
  @IsEnum(MotivoCierre)
  @IsNotEmpty()
  motivoCierre: MotivoCierre;

  @ApiProperty()
  @IsISO8601({})
  fechaHora: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  estadoVictima?: string;

  @ApiPropertyOptional({ type: [AgresorCierreDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AgresorCierreDto)
  agresores?: AgresorCierreDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observaciones?: string;
}
