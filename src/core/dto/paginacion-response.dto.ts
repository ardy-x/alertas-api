import { ApiProperty } from '@nestjs/swagger';

export class PaginacionDto {
  @ApiProperty()
  paginaActual: number;

  @ApiProperty()
  totalPaginas: number;

  @ApiProperty()
  totalElementos: number;

  @ApiProperty()
  elementosPorPagina: number;
}
