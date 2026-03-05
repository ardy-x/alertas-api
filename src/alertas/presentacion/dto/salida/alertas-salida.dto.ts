import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaginacionDto } from '@/core/dto/paginacion-response.dto';
import { RutaLineString, UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { VictimaBaseResponseDto, VictimaResponseDto } from '@/victimas/presentacion/dto/salida/victima.dto';

export class FuncionarioAsignadoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rolAtencion: string;

  @ApiPropertyOptional()
  ubicacion?: UbicacionPoint | null;

  @ApiProperty()
  turnoInicio: string;

  @ApiProperty()
  turnoFin: string;

  @ApiPropertyOptional()
  grado?: string | null;

  @ApiPropertyOptional()
  nombreCompleto?: string | null;

  @ApiPropertyOptional()
  unidad?: string | null;

  @ApiPropertyOptional({ description: 'Fecha y hora en que el funcionario llegó al lugar' })
  fechaLlegada?: string | null;
  @ApiPropertyOptional({ description: 'Confirmación de llegada por la víctima' })
  confirmacionVictima?: boolean;
}

export class AtencionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  siglaVehiculo: string;

  @ApiProperty()
  siglaRadio: string;

  @ApiPropertyOptional()
  usuarioWeb?: {
    id: string;
    nombreCompleto: string;
    grado: string;
  } | null;

  @ApiPropertyOptional({ type: [FuncionarioAsignadoDto] })
  atencionFuncionario?: FuncionarioAsignadoDto[];
}

export class EventoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tipoEvento: string;

  @ApiProperty()
  fechaHora: Date;

  @ApiPropertyOptional()
  ubicacion?: UbicacionPoint | null;
}

export class AgresorDto {
  @ApiProperty()
  cedulaIdentidad: string;

  @ApiProperty()
  nombreCompleto: string;

  @ApiPropertyOptional()
  parentesco?: string | null;
}

export class CierreAlertaDto {
  @ApiProperty()
  fechaHora: Date;

  @ApiProperty()
  estadoVictima: string;

  @ApiProperty({ type: [AgresorDto] })
  agresores: AgresorDto[];

  @ApiProperty()
  motivoCierre: string;

  @ApiPropertyOptional()
  observaciones?: string | null;
}

export class RutaAlertaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  idAlerta: string;

  @ApiProperty()
  ruta: RutaLineString;
}

export class SolicitudCancelacionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fechaSolicitud: Date;

  @ApiProperty()
  estadoSolicitud: string;

  @ApiPropertyOptional()
  motivoCancelacion?: string | null;

  @ApiPropertyOptional()
  usuarioWeb?: {
    id: string;
    nombreCompleto: string;
    grado: string;
  } | null;
}

export class AlertaDetalleDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  idVictima?: string | null;

  @ApiPropertyOptional()
  idMunicipio?: number | null;

  @ApiProperty()
  fechaHora: Date;

  @ApiPropertyOptional()
  codigoCud?: string | null;

  @ApiPropertyOptional()
  codigoRegistro?: string | null;

  @ApiProperty()
  estadoAlerta: string;

  @ApiPropertyOptional()
  ubicacion?: UbicacionPoint | null;

  @ApiProperty()
  origen: string;

  @ApiPropertyOptional()
  municipio?: string;

  @ApiPropertyOptional()
  provincia?: string;

  @ApiPropertyOptional()
  departamento?: string;

  @ApiPropertyOptional()
  victima?: Partial<VictimaResponseDto>;

  @ApiPropertyOptional()
  atencion?: AtencionDto;

  @ApiPropertyOptional({ type: [EventoDto] })
  eventos?: EventoDto[];

  @ApiPropertyOptional()
  cierre?: CierreAlertaDto;

  @ApiPropertyOptional()
  rutaAlerta?: RutaAlertaDto;

  @ApiPropertyOptional({ type: [SolicitudCancelacionDto] })
  solicitudesCancelacion?: SolicitudCancelacionDto[];
}

export class AlertaBaseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  idVictima?: string | null;

  @ApiProperty()
  estadoAlerta: string;

  @ApiProperty()
  fechaHora: Date;

  @ApiPropertyOptional()
  ubicacion?: UbicacionPoint | null;

  @ApiProperty()
  origen: string;

  @ApiPropertyOptional()
  idMunicipio?: number | null;
}

export class AlertaActivaDto extends AlertaBaseDto {
  @ApiPropertyOptional()
  victima?: Partial<VictimaBaseResponseDto>;

  @ApiPropertyOptional()
  municipio?: string;

  @ApiPropertyOptional()
  provincia?: string;

  @ApiPropertyOptional()
  departamento?: string;
}

export class AlertaHistorialDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  idVictima?: string | null;

  @ApiProperty()
  estadoAlerta: string;

  @ApiProperty()
  fechaHora: Date;

  @ApiProperty()
  origen: string;

  @ApiPropertyOptional()
  idMunicipio?: number | null;

  @ApiPropertyOptional()
  municipio?: string;

  @ApiPropertyOptional()
  provincia?: string;

  @ApiPropertyOptional()
  departamento?: string;

  @ApiPropertyOptional()
  codigoCud?: string | null;

  @ApiPropertyOptional()
  codigoRegistro?: string | null;

  @ApiPropertyOptional()
  victima?: Partial<VictimaBaseResponseDto>;
}

export class FuncionarioLlegadoDto {
  @ApiProperty()
  declare ciFuncionario: string;

  @ApiPropertyOptional()
  grado?: string | null;

  @ApiPropertyOptional()
  nombreCompleto?: string | null;

  @ApiProperty()
  declare rolAtencion: string;

  @ApiProperty()
  declare fechaLlegada: string;
}

export class CrearAlertaResponseDto {
  @ApiProperty()
  alerta: {
    id: string;
    estadoAlerta: string;
  };
}

export class ObtenerHistorialAlertasResponseDto {
  @ApiProperty({ type: [AlertaHistorialDto] })
  historial: AlertaHistorialDto[];

  @ApiPropertyOptional()
  paginacion?: PaginacionDto;
}
