import { ApiProperty } from '@nestjs/swagger';

export class EstadoAlertaDistribucionDto {
  @ApiProperty({ example: 'Pendiente' })
  estado: string;

  @ApiProperty({ example: 150 })
  cantidad: number;

  @ApiProperty({ example: 25.5 })
  porcentaje: number;
}

export class DistribucionEstadosDto {
  @ApiProperty({ type: [EstadoAlertaDistribucionDto] })
  estados: EstadoAlertaDistribucionDto[];

  @ApiProperty({ example: 500 })
  total_alertas: number;
}
