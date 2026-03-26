import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';

export class ObtenerUsuariosSistemaQueryDto extends PaginacionQueryDto {
  @ApiPropertyOptional({ enum: RolesPermitidos })
  @IsOptional()
  @IsEnum(RolesPermitidos)
  rol?: RolesPermitidos;
}
