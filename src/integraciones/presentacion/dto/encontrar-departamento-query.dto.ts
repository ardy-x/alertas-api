import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class EncontrarDepartamentoQueryDto {
  @ApiProperty({
    description: 'Latitud de la ubicación',
    example: -16.5,
    examples: {
      'La Paz': { value: -16.5, description: 'Ciudad de La Paz' },
      Cochabamba: { value: -17.3895, description: 'Ciudad de Cochabamba' },
      'Santa Cruz': { value: -17.7833, description: 'Ciudad de Santa Cruz' },
      Oruro: { value: -17.9633, description: 'Ciudad de Oruro' },
      Potosí: { value: -19.5836, description: 'Ciudad de Potosí' },
      Chuquisaca: { value: -19.0333, description: 'Ciudad de Sucre' },
      Tarija: { value: -21.5355, description: 'Ciudad de Tarija' },
      Beni: { value: -14.8333, description: 'Ciudad de Trinidad' },
      Pando: { value: -11.0267, description: 'Ciudad de Cobija' },
    },
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90, { message: 'La latitud debe estar entre -90 y 90 grados' })
  @Max(90, { message: 'La latitud debe estar entre -90 y 90 grados' })
  declare latitud: number;

  @ApiProperty({
    description: 'Longitud de la ubicación',
    example: -68.1501,
    examples: {
      'La Paz': { value: -68.1501, description: 'Ciudad de La Paz' },
      Cochabamba: { value: -66.1568, description: 'Ciudad de Cochabamba' },
      'Santa Cruz': { value: -63.1821, description: 'Ciudad de Santa Cruz' },
      Oruro: { value: -67.1111, description: 'Ciudad de Oruro' },
      Potosí: { value: -65.7531, description: 'Ciudad de Potosí' },
      Chuquisaca: { value: -65.2627, description: 'Ciudad de Sucre' },
      Tarija: { value: -64.7296, description: 'Ciudad de Tarija' },
      Beni: { value: -64.9, description: 'Ciudad de Trinidad' },
      Pando: { value: -68.7692, description: 'Ciudad de Cobija' },
    },
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180, { message: 'La longitud debe estar entre -180 y 180 grados' })
  @Max(180, { message: 'La longitud debe estar entre -180 y 180 grados' })
  declare longitud: number;
}
