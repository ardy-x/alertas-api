import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class DecodificarTokenRequestDto {
  @ApiProperty()
  @IsUUID()
  declare codigo: string;

  @ApiProperty({
    example: -17.7833,
  })
  @IsNumber()
  @Min(-22.9)
  @Max(-9.6)
  declare latitud: number;

  @ApiProperty({
    example: -63.1821,
  })
  @IsNumber()
  @Min(-69.7)
  @Max(-57.4)
  declare longitud: number;
}
