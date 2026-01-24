import { ApiProperty } from '@nestjs/swagger';

import { PaginacionDto } from '@/core/dto/paginacion-response.dto';

export class UsuarioWebResponseDto {
  @ApiProperty()
  grado: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  unidad: string;

  @ApiProperty()
  estadoSession: boolean;
}

export class UsuarioWebSimpleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  grado: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  unidad: string;

  @ApiProperty()
  estadoSession: boolean;

  @ApiProperty()
  actualizadoEn: Date;
}

export class ListarUsuariosWebResponseDto {
  @ApiProperty({ type: [UsuarioWebSimpleResponseDto] })
  usuarios: UsuarioWebSimpleResponseDto[];

  @ApiProperty({ type: PaginacionDto })
  paginacion: PaginacionDto;
}
