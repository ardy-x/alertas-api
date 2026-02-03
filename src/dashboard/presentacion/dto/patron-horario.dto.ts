import { ApiProperty } from '@nestjs/swagger';

export class IntensidadHorariaDto {
  @ApiProperty({ example: 'Lunes' })
  dia_semana: string;

  @ApiProperty({ example: 14, description: 'Hora del día (0-23)' })
  hora: number;

  @ApiProperty({ example: 25 })
  cantidad: number;
}

export class HoraPicoDto {
  @ApiProperty({ example: 'Viernes' })
  dia: string;

  @ApiProperty({ example: 18 })
  hora: number;

  @ApiProperty({ example: 45 })
  cantidad: number;
}

export class PatronHorarioDto {
  @ApiProperty({ type: [IntensidadHorariaDto], description: 'Matriz de 168 elementos (7 días × 24 horas)' })
  datos: IntensidadHorariaDto[];

  @ApiProperty({ example: 1250 })
  total_alertas: number;

  @ApiProperty({ type: HoraPicoDto })
  hora_pico: HoraPicoDto;
}
