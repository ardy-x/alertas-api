import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ContactoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  celular: string;
}

export class ContactoAdicionalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  celular: string;
}

export class PersonaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cedulaIdentidad: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  celular: string;

  @ApiPropertyOptional({ type: [ContactoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactoDto)
  contactos?: ContactoDto[];

  @ApiPropertyOptional({ type: [ContactoAdicionalDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactoAdicionalDto)
  contactosAdicionales?: ContactoAdicionalDto[];
}

export class RecibirDatosAttDto {
  @ApiProperty({ type: PersonaDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PersonaDto)
  persona: PersonaDto;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  ubicacion?: { latitud: number; longitud: number };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;
}
