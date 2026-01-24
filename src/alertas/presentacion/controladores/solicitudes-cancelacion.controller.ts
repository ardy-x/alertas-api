import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListarSolicitudesUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/listar-solicitudes.use-case';
import { ObtenerSolicitudDetalleUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/obtener-solicitud-detalle.use-case';
import { ProcesarSolicitudUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/procesar-solicitud.use-case';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { ObtenerSolicitudesCancelacionRequestDto, ProcesarSolicitudCancelacionRequestDto } from '../dto/entrada/solicitudes-cancelacion-entrada.dto';
import { ObtenerSolicitudDetalleResponseDto, ObtenerSolicitudesResponseDto } from '../dto/salida/solicitudes-cancelacion-salida.dto';

@Controller('solicitudes-cancelacion')
@UseGuards(KerberosJwtAuthGuard)
@ApiTags('SOLICITUDES DE CANCELACIÓN')
export class SolicitudesCancelacionController {
  constructor(
    private readonly obtenerSolicitudesUseCase: ListarSolicitudesUseCase,
    private readonly procesarSolicitudUseCase: ProcesarSolicitudUseCase,
    private readonly obtenerSolicitudDetalleUseCase: ObtenerSolicitudDetalleUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las solicitudes de cancelación' })
  async obtenerTodas(@Query() query: ObtenerSolicitudesCancelacionRequestDto): Promise<RespuestaBaseDto<ObtenerSolicitudesResponseDto>> {
    const resultado = await this.obtenerSolicitudesUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Solicitudes de cancelación obtenidas exitosamente', resultado);
  }

  @Get(':idSolicitud/detalle')
  @ApiOperation({ summary: 'Obtener detalle de solicitud de cancelación' })
  async obtenerDetalle(@Param('idSolicitud', ParseUUIDPipe) idSolicitud: string): Promise<RespuestaBaseDto<ObtenerSolicitudDetalleResponseDto>> {
    const resultado = await this.obtenerSolicitudDetalleUseCase.ejecutar(idSolicitud);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Detalle de solicitud obtenido exitosamente', resultado);
  }

  @Put(':idSolicitud')
  @ApiOperation({ summary: 'Procesar solicitud de cancelación' })
  @ApiBody({ type: ProcesarSolicitudCancelacionRequestDto })
  async procesar(
    @Param('idSolicitud', ParseUUIDPipe) idSolicitud: string,
    @IdUsuarioActual() idUsuarioWeb: string,
    @Body() entrada: ProcesarSolicitudCancelacionRequestDto,
  ): Promise<RespuestaBaseDto<null>> {
    await this.procesarSolicitudUseCase.ejecutar(idSolicitud, idUsuarioWeb, entrada);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Solicitud de cancelación procesada exitosamente');
  }
}
