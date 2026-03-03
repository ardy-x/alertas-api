import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';

export class PermisoAppDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  declare ubicacion: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  declare ubicacionSegundoPlano: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  declare notificaciones: boolean;
}

export class RegistrarConexionRequestDto {
  @ApiProperty({ type: PermisoAppDto, description: 'Estado de permisos de la aplicación' })
  @ValidateNested()
  @Type(() => PermisoAppDto)
  @IsNotEmpty()
  declare permisosApp: PermisoAppDto;
}
