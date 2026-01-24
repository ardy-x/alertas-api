import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ContactoEmergenciaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  celular: string;

  @ApiProperty()
  @IsBoolean()
  principal: boolean;
}

export class ActualizarContactoEmergenciaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentesco?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  celular?: string;
}
