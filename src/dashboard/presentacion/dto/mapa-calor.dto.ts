import { ApiProperty } from '@nestjs/swagger';

export class DatoDepartamentoDto {
  @ApiProperty({ example: 2 })
  id_departamento: number;

  @ApiProperty({ example: 'La Paz' })
  nombre_departamento: string;

  @ApiProperty({ example: 450 })
  total_alertas: number;

  @ApiProperty({ example: 120 })
  alertas_activas: number;
}

export class DatoProvinciaDto {
  @ApiProperty({ example: 10 })
  id_provincia: number;

  @ApiProperty({ example: 'Pedro Domingo Murillo' })
  nombre_provincia: string;

  @ApiProperty({ example: 'La Paz' })
  nombre_departamento: string;

  @ApiProperty({ example: 230 })
  total_alertas: number;

  @ApiProperty({ example: 65 })
  alertas_activas: number;
}

export class DatoMunicipioDto {
  @ApiProperty({ example: 100 })
  id_municipio: number;

  @ApiProperty({ example: 'Murillo' })
  nombre_municipio: string;

  @ApiProperty({ example: 'Pedro Domingo Murillo' })
  nombre_provincia: string;

  @ApiProperty({ example: 'La Paz' })
  nombre_departamento: string;

  @ApiProperty({ example: 85 })
  total_alertas: number;

  @ApiProperty({ example: 22 })
  alertas_activas: number;
}

export class FiltroAplicadoDto {
  @ApiProperty({ example: 2, required: false })
  id_departamento?: number;

  @ApiProperty({ example: 10, required: false })
  id_provincia?: number;
}

export class MapaCalorDto {
  @ApiProperty({ example: 'departamentos', enum: ['departamentos', 'provincias', 'municipios'] })
  nivel: 'departamentos' | 'provincias' | 'municipios';

  @ApiProperty({ type: [Object], description: 'Datos según el nivel: DatoDepartamentoDto[] | DatoProvinciaDto[] | DatoMunicipioDto[]' })
  datos: DatoDepartamentoDto[] | DatoProvinciaDto[] | DatoMunicipioDto[];

  @ApiProperty({ example: 1250 })
  total_alertas: number;

  @ApiProperty({ type: FiltroAplicadoDto, nullable: true })
  filtro_aplicado: FiltroAplicadoDto | null;
}
