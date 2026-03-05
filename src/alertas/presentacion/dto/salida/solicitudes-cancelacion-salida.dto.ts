import { ApiProperty } from '@nestjs/swagger';

import { IsDate, IsEnum, IsString } from 'class-validator';

import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { PaginacionDto } from '@/core/dto/paginacion-response.dto';
export class VictimaDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  nombreCompleto: string;

  @ApiProperty()
  @IsString()
  cedulaIdentidad: string;

  @ApiProperty()
  @IsString()
  celular: string;

  @ApiProperty()
  @IsString()
  correo?: string;
}

export class SolicitudCancelacionListadoDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  idAlerta: string;

  @ApiProperty()
  @IsDate()
  fechaSolicitud: Date;

  @ApiProperty({ enum: EstadoSolicitudCancelacion })
  @IsEnum(EstadoSolicitudCancelacion)
  estadoSolicitud: EstadoSolicitudCancelacion;

  @ApiProperty({ type: VictimaDto })
  victima: VictimaDto;
}

export class SolicitudCancelacionDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  idAlerta: string;

  @ApiProperty()
  @IsString()
  fechaSolicitud: string;

  @ApiProperty({ enum: EstadoSolicitudCancelacion })
  @IsEnum(EstadoSolicitudCancelacion)
  estadoSolicitud: EstadoSolicitudCancelacion;

  @ApiProperty()
  @IsString()
  motivoCancelacion: string;

  @ApiProperty({ type: VictimaDto })
  victima: VictimaDto;

  @ApiProperty()
  @IsString()
  usuarioAprobador: string;

  @ApiProperty()
  @IsString()
  gradoUsuarioAprobador: string;

  @ApiProperty()
  @IsString()
  fechaHoraProcesamiento: string;
}

export class ObtenerSolicitudesResponseDto {
  @ApiProperty({ type: [SolicitudCancelacionListadoDto] })
  solicitudes: SolicitudCancelacionListadoDto[];

  @ApiProperty({ type: PaginacionDto })
  paginacion: PaginacionDto;
}

export class ObtenerSolicitudDetalleResponseDto {
  @ApiProperty({ type: SolicitudCancelacionDto })
  solicitud: SolicitudCancelacionDto;
}
