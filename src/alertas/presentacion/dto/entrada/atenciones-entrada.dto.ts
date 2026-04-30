import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

import { RolAtencion } from '@/alertas/dominio/enums/atencion-enums';
import { UbicacionSimpleDto } from '@/integraciones/presentacion/dto/ubicacion.dto';

export class FuncionarioRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  grado: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unidad: string;
}

export class FuncionarioAtencionRequestDto {
  @ApiPropertyOptional({ enum: RolAtencion })
  @IsOptional()
  @IsEnum(RolAtencion)
  rolAtencion?: RolAtencion;

  @ApiPropertyOptional({
    example: {
      latitud: -16.5,
      longitud: -68.15,
      precision: 10,
      marcaTiempo: '2026-04-14T12:00:00.000Z',
    },
  })
  @IsOptional()
  ubicacion?: UbicacionSimpleDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  turnoInicio: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  turnoFin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ciFuncionario: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unidad: string;
}

export class CrearAtencionCompletaRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  idAlerta: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siglaVehiculo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  siglaRadio?: string;

  @ApiProperty({ type: [FuncionarioAtencionRequestDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FuncionarioAtencionRequestDto)
  funcionarios: FuncionarioAtencionRequestDto[];
}

export class CrearFuncionarioAtencionRequestDto {
  @ApiProperty({ enum: RolAtencion })
  @IsOptional()
  @IsEnum(RolAtencion)
  rolAtencion?: RolAtencion;

  @ApiPropertyOptional({ type: UbicacionSimpleDto })
  @IsOptional()
  ubicacion?: UbicacionSimpleDto;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  turnoInicio: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  turnoFin: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  ciFuncionario: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  unidad: string;
}

export class RegistrarLlegadaRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  declare ciFuncionario: string;
}

export class ConfirmacionVictimaRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  declare ciFuncionario: string;
}
