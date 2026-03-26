import { ApiProperty } from '@nestjs/swagger';

export class DepartamentoDto {
  @ApiProperty({ example: 1, description: 'ID del departamento' })
  declare id: number;

  @ApiProperty({ example: 'La Paz', description: 'Nombre del departamento' })
  declare departamento: string;
}

export class ProvinciaDto {
  @ApiProperty({ example: 10, description: 'ID de la provincia' })
  declare id: number;

  @ApiProperty({ example: 'Pedro Domingo Murillo', description: 'Nombre de la provincia' })
  declare provincia: string;
}

export class MunicipioSimpleDto {
  @ApiProperty({ example: 100, description: 'ID del municipio' })
  declare id: number;

  @ApiProperty({ example: 'La Paz', description: 'Nombre del municipio' })
  declare municipio: string;
}

export class MunicipioProvinciaDepartamentoDto {
  @ApiProperty({ type: MunicipioSimpleDto, description: 'Información del municipio' })
  declare municipio: MunicipioSimpleDto;

  @ApiProperty({ type: ProvinciaDto, description: 'Información de la provincia' })
  declare provincia: ProvinciaDto;

  @ApiProperty({ type: DepartamentoDto, description: 'Información del departamento' })
  declare departamento: DepartamentoDto;
}
