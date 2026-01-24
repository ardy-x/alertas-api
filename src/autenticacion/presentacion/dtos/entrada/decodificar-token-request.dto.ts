import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID, Max, Min } from 'class-validator';

export class DecodificarTokenRequestDto {
  @ApiProperty()
  @IsUUID()
  codigo: string;

  @ApiProperty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @ApiProperty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;
}
