import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';

import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';
import { EstadoCuenta } from '@/victimas/dominio/enums/victima-enums';

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

export class CrearVictimaRequestDto {
  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 20)
  cedulaIdentidad: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty({ example: '71234567' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 15)
  celular: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  idMunicipio: number;

  @ApiProperty({ example: '1990-05-15' })
  @IsDateString()
  fechaNacimiento: string;

  @ApiPropertyOptional({ example: 'juan@example.com' })
  @IsString()
  @IsEmail()
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: 'Calle 123, Zona Centro' })
  @IsString()
  @IsNotEmpty()
  direccionDomicilio: string;

  @ApiProperty({ example: 'Cerca del mercado' })
  @IsString()
  @IsNotEmpty()
  puntoReferencia: string;

  @ApiProperty({ example: [{ parentesco: 'Hermano', nombreCompleto: 'Pedro Pérez', celular: '71234568', principal: true }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactoEmergenciaDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  contactosEmergencia: ContactoEmergenciaDto[];
}

// DTO para actualizar ubicación de la víctima
export class ActualizarUbicacionRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  direccionDomicilio?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  puntoReferencia?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  idMunicipio?: number;
}

// DTO para actualizar datos de contacto de la víctima
export class ActualizarDatosContactoRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Length(8, 15)
  celular?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsEmail()
  @IsOptional()
  correo?: string;
}

// DTO para información del dispositivo
export class InformacionDispositivoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  marca?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  modelo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  versionSO?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  versionApp?: string;
}

// DTO para actualizar datos de cuenta de la víctima
export class ActualizarDatosCuentaRequestDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  idDispositivo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fcmToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => InformacionDispositivoDto)
  infoDispositivo?: InformacionDispositivoDto;
}

// DTO para listar víctimas (query parameters)
export class ListarVictimasRequestDto extends PaginacionQueryDto {
  @ApiPropertyOptional({
    example: ['ACTIVA', 'INACTIVA'],
    isArray: true,
    enum: EstadoCuenta,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map((s) => s.trim());
    return undefined;
  })
  @IsArray()
  @IsEnum(EstadoCuenta, { each: true, message: 'cada valor en $property debe ser uno de: ACTIVA, INACTIVA, SUSPENDIDA, PENDIENTE_VERIFICACION' })
  estadoCuenta?: EstadoCuenta[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idDepartamento?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idProvincia?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idMunicipio?: number;
}

export class ObtenerHistorialAlertasParamsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ci?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  idVictima?: string;
}

export class VerificarVictimaParamsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ci: string;
}
