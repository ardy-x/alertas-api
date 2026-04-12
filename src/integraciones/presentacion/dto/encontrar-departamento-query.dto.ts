import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class EncontrarDepartamentoQueryDto {
  @ApiProperty({ example: -17.7833 })
  @Type(() => Number)
  @IsNumber()
  @Min(-22.9)
  @Max(-9.6)
  declare latitud: number;

  @ApiProperty({ example: -63.1821 })
  @Type(() => Number)
  @IsNumber()
  @Min(-69.7)
  @Max(-57.4)
  declare longitud: number;
}
