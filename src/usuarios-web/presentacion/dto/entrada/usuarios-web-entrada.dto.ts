import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class InfoDispositivoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  navegador?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sistemaOperativo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dispositivo?: string;
}

export class RegistrarTokenFCMRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fcmToken: string;

  @ApiPropertyOptional({
    type: InfoDispositivoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InfoDispositivoDto)
  infoDispositivo?: InfoDispositivoDto;
}
