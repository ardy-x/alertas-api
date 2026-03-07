import { ApiProperty } from '@nestjs/swagger';

export class TiempoConDescripcionDto {
  @ApiProperty()
  tiempo: string;

  @ApiProperty()
  descripcion: string;
}

export class MetricasGeneralesDto {
  @ApiProperty()
  alertasActivas: number;

  @ApiProperty()
  alertasPendientes: number;

  @ApiProperty()
  alertasResueltas: number;

  @ApiProperty({ type: TiempoConDescripcionDto })
  promedioAsignacion: TiempoConDescripcionDto;

  @ApiProperty({ type: TiempoConDescripcionDto })
  promedioAtencionTotal: TiempoConDescripcionDto;

  @ApiProperty({ type: TiempoConDescripcionDto })
  promedioRegistro: TiempoConDescripcionDto;

  @ApiProperty({ type: TiempoConDescripcionDto })
  promedioLlegada: TiempoConDescripcionDto;
}

export class AlertaPorDepartamentoDto {
  @ApiProperty()
  nombreDepartamento: string;

  @ApiProperty()
  totalAlertas: number;

  @ApiProperty()
  alertasActivas: number;

  @ApiProperty()
  alertasCerradas: number;
}

export class AlertaPorProvinciaDto {
  @ApiProperty()
  idProvincia: number;

  @ApiProperty()
  nombreProvincia: string;

  @ApiProperty()
  nombreDepartamento: string;

  @ApiProperty()
  totalAlertas: number;

  @ApiProperty()
  alertasActivas: number;
}

export class AlertaPorMunicipioDto {
  @ApiProperty()
  idMunicipio: number;

  @ApiProperty()
  nombreMunicipio: string;

  @ApiProperty()
  nombreProvincia: string;

  @ApiProperty()
  nombreDepartamento: string;

  @ApiProperty()
  totalAlertas: number;

  @ApiProperty()
  alertasActivas: number;
}

export class AlertasGeograficasDto {
  @ApiProperty({
    type: [AlertaPorDepartamentoDto],
  })
  departamentos: AlertaPorDepartamentoDto[];
}
