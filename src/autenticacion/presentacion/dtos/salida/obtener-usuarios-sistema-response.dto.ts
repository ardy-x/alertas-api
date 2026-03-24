import { ApiProperty } from '@nestjs/swagger';
import { PaginacionDto } from '@/core/dto/paginacion-response.dto';

export class UsuarioSistemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  numeroDocumento: string;

  @ApiProperty()
  fotografiaUrl: string;

  @ApiProperty()
  grado: string;

  @ApiProperty()
  unidad: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  estado: boolean;
}

export class ObtenerUsuariosSistemaDatosDto {
  @ApiProperty({ type: [UsuarioSistemaDto] })
  usuarios: UsuarioSistemaDto[];

  @ApiProperty({ type: PaginacionDto })
  paginacion: PaginacionDto;
}
