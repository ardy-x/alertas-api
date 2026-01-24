import { ApiProperty } from '@nestjs/swagger';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';

export class SubmoduloDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  ruta: string;

  @ApiProperty()
  icono: string;

  @ApiProperty()
  orden: number;

  @ApiProperty({ type: [Object] })
  submodulos: SubmoduloDto[];
}

export class ModuloDto {
  @ApiProperty()
  nombre: string;

  @ApiProperty()
  ruta: string;

  @ApiProperty()
  icono: string;

  @ApiProperty()
  orden: number;

  @ApiProperty({ type: [SubmoduloDto] })
  submodulos: SubmoduloDto[];
}

export class DatosSistemaDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [ModuloDto] })
  modulos: ModuloDto[];

  @ApiProperty({ type: [String] })
  permisos: string[];

  @ApiProperty()
  rol: string;
}

export class DatosUsuarioDto {
  @ApiProperty()
  idUsuario: string;

  @ApiProperty()
  nombreUsuario: string;

  @ApiProperty()
  correo: string;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  nombreCompleto: string;

  @ApiProperty()
  imagenUsuario: string;

  @ApiProperty()
  verificado: boolean;

  @ApiProperty()
  creadoEn: string;

  @ApiProperty()
  ultimoAcceso: string;

  @ApiProperty()
  unidad: string;

  @ApiProperty()
  grado: string;
}

export class TokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}

export class UbicacionUsuarioDto {
  @ApiProperty()
  departamento: string;

  @ApiProperty()
  idDepartamento: number;

  @ApiProperty()
  latitud: number;

  @ApiProperty()
  longitud: number;
}

export class DecodificarTokenDatosDto {
  @ApiProperty({ type: TokensDto })
  tokens: TokensDto;

  @ApiProperty({ type: DatosSistemaDto })
  datosSistema: DatosSistemaDto;

  @ApiProperty({ type: DatosUsuarioDto })
  datosUsuario: DatosUsuarioDto;

  @ApiProperty({ type: UbicacionUsuarioDto })
  ubicacionUsuario: UbicacionUsuarioDto;

  @ApiProperty()
  iat: number;

  @ApiProperty()
  exp: number;
}

export class DecodificarTokenResponseDto extends RespuestaBaseDto<DecodificarTokenDatosDto> {}
