import { ApiProperty } from '@nestjs/swagger';

export class MetricasGeneralesDto {
  @ApiProperty()
  alertasActivas: number;

  @ApiProperty()
  alertasPendientes: number;

  @ApiProperty()
  alertasResueltas: number;

  @ApiProperty()
  tiempoPromedioAsignacion: string;

  @ApiProperty()
  tiempoPromedioAtencionTotal: string;

  @ApiProperty()
  tiempoPromedioRegistro: string;
}

export class AlertaPorDepartamentoDto {
  @ApiProperty()
  idDepartamento: number;

  @ApiProperty()
  nombreDepartamento: string;

  @ApiProperty()
  totalAlertas: number;

  @ApiProperty()
  alertasActivas: number;

  @ApiProperty()
  alertasPendientes: number;

  @ApiProperty()
  alertasResueltas: number;
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

  @ApiProperty({
    type: [AlertaPorProvinciaDto],
  })
  provincias: AlertaPorProvinciaDto[];

  @ApiProperty({
    type: [AlertaPorMunicipioDto],
  })
  municipios: AlertaPorMunicipioDto[];
}

export class AlertaRecienteDto {
  @ApiProperty()
  idAlerta: string;

  @ApiProperty()
  idMunicipio?: number;

  @ApiProperty()
  nombreCompletoVictima: string;

  @ApiProperty()
  nombreMunicipio: string;

  @ApiProperty()
  estadoAlerta: string;

  @ApiProperty()
  origen: string;

  @ApiProperty()
  fechaCreacion: Date;

  @ApiProperty()
  tiempoTranscurrido: string;
}

export class MetricasPorOrigenDto {
  @ApiProperty()
  origen: string;

  @ApiProperty()
  tiempoPromedioAsignacion: string;

  @ApiProperty()
  tiempoPromedioAtencionTotal: string;

  @ApiProperty()
  cantidadAlertas: number;
}

export class MetricasTiempoDto {
  @ApiProperty()
  tiempoPromedioAsignacion: string;

  @ApiProperty()
  tiempoPromedioAtencionTotal: string;

  @ApiProperty()
  tiempoPromedioRegistro: string;

  @ApiProperty({
    type: [MetricasPorOrigenDto],
  })
  metricasPorOrigen: MetricasPorOrigenDto[];
}
