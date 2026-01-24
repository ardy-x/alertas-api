import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { CoordenadaSimpleDto } from '@/integraciones/presentacion/dto/ubicacion.dto';

export class CrearPuntoRutaRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  idAlerta: string;

  @ApiProperty({ type: CoordenadaSimpleDto })
  @ValidateNested()
  @Type(() => CoordenadaSimpleDto)
  coordenadas: CoordenadaSimpleDto;
}
