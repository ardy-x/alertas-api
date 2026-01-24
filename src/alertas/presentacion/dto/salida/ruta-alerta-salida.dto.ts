import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean } from 'class-validator';

export class CrearPuntoRutaResponseDto {
  @ApiProperty()
  @IsBoolean()
  rutaCreada: boolean;
}
