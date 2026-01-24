import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class PaginacionQueryDto {
  @ApiProperty({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number;

  @ApiProperty({ default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  elementosPorPagina: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'creadoEn',
  })
  @IsOptional()
  @IsString()
  ordenarPor?: string;

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  orden?: 'ASC' | 'DESC';
}
