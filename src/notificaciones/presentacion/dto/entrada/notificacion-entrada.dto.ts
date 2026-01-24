import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

import { TipoDestinatario } from '../../../dominio/entidades/notificacion.entity';

export class EnviarNotificacionRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fcmToken: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  cuerpo: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(TipoDestinatario)
  tipoDestinatario: TipoDestinatario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  datos?: Record<string, string>;
}
