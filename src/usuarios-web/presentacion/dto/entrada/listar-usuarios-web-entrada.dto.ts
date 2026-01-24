import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';

export class ListarUsuariosWebRequestDto extends PaginacionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  estadoSession?: boolean;
}
