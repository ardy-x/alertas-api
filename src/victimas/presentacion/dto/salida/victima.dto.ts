import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginacionDto } from '@/core/dto/paginacion-response.dto';

export class VictimaBaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cedulaIdentidad: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  celular: string;

  @ApiPropertyOptional()
  correo?: string;

  @ApiProperty()
  estadoCuenta: string;

  @ApiProperty()
  creadoEn: Date;
}

export class ContactoEmergenciaResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  parentesco: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  celular: string;

  @ApiProperty()
  principal: boolean;
}

export class VictimaResponseDto extends VictimaBaseResponseDto {
  @ApiProperty()
  idMunicipio: number;

  @ApiProperty()
  municipio: string;

  @ApiProperty()
  provincia: string;

  @ApiProperty()
  departamento: string;

  @ApiProperty()
  fechaNacimiento: Date;

  @ApiProperty()
  direccionDomicilio: string;

  @ApiProperty()
  puntoReferencia: string;

  @ApiProperty()
  contactosEmergencia: ContactoEmergenciaResponseDto[];
}

export class ListarVictimasData {
  @ApiProperty({ type: [VictimaBaseResponseDto] })
  victimas: VictimaBaseResponseDto[];

  @ApiProperty({ type: PaginacionDto })
  paginacion: PaginacionDto;
}

export class VerificarVictimaResponse {
  @ApiProperty()
  existe: boolean;

  @ApiPropertyOptional()
  idVictima?: string;

  @ApiPropertyOptional()
  estadoCuenta?: string;

  @ApiPropertyOptional()
  idDispositivo?: string;
}
