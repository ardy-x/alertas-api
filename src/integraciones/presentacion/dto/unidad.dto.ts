import { ApiProperty } from '@nestjs/swagger';

export class UbicacionDto {
  @ApiProperty()
  declare latitud: number;

  @ApiProperty()
  declare longitud: number;
}

export class UnidadDto {
  @ApiProperty()
  declare id: number;

  @ApiProperty()
  declare unidad: string;

  @ApiProperty()
  declare direccion: string;

  @ApiProperty()
  declare ubicacion: UbicacionDto;

  @ApiProperty()
  declare referencia: string;

  @ApiProperty()
  declare departamento: string;

  @ApiProperty()
  declare provincia: string;

  @ApiProperty()
  declare municipio: string;

  @ApiProperty({ required: false })
  declare organismo?: string;
}
