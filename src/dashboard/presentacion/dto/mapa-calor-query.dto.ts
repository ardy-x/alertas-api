import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class MapaCalorQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por departamento' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idDepartamento?: number;

  @ApiPropertyOptional({ description: 'Filtrar por provincia' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idProvincia?: number;

  @ApiPropertyOptional({ description: 'Filtrar por municipio' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  idMunicipio?: number;
}
