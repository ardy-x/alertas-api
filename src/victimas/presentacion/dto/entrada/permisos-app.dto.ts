import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class PermisosAppDto {
  @ApiProperty({ example: true, description: 'Permiso de ubicación' })
  @IsBoolean()
  @IsNotEmpty()
  declare ubicacion: boolean;

  @ApiProperty({ example: true, description: 'Permiso de notificaciones' })
  @IsBoolean()
  @IsNotEmpty()
  declare notificaciones: boolean;
}
