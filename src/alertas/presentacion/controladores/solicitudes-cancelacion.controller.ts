import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ListarSolicitudesUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/listar-solicitudes.use-case';
import { ObtenerSolicitudDetalleUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/obtener-solicitud-detalle.use-case';
import { ProcesarSolicitudUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/procesar-solicitud.use-case';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerSolicitudesCancelacionRequestDto, ProcesarSolicitudCancelacionRequestDto } from '../dto/entrada/solicitudes-cancelacion-entrada.dto';
import { ObtenerSolicitudDetalleResponseDto, ObtenerSolicitudesResponseDto } from '../dto/salida/solicitudes-cancelacion-salida.dto';

@ApiTags('SOLICITUDES DE CANCELACIÓN')
@ApiSecurity('jwt-auth')
@Controller('solicitudes-cancelacion')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR)
export class SolicitudesCancelacionController {
  constructor(
    private readonly obtenerSolicitudesUseCase: ListarSolicitudesUseCase,
    private readonly procesarSolicitudUseCase: ProcesarSolicitudUseCase,
    private readonly obtenerSolicitudDetalleUseCase: ObtenerSolicitudDetalleUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las solicitudes de cancelación', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Solicitudes de cancelación obtenidas exitosamente', type: ObtenerSolicitudesResponseDto })
  async obtenerTodas(@Query() query: ObtenerSolicitudesCancelacionRequestDto): Promise<RespuestaBaseDto<ObtenerSolicitudesResponseDto>> {
    const resultado = await this.obtenerSolicitudesUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Solicitudes de cancelación obtenidas exitosamente', resultado);
  }

  @Get(':idSolicitud/detalle')
  @ApiOperation({ summary: 'Obtener detalle de solicitud de cancelación', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Detalle de solicitud obtenido exitosamente', type: ObtenerSolicitudDetalleResponseDto })
  async obtenerDetalle(@Param('idSolicitud', ParseUUIDPipe) idSolicitud: string): Promise<RespuestaBaseDto<ObtenerSolicitudDetalleResponseDto>> {
    const resultado = await this.obtenerSolicitudDetalleUseCase.ejecutar(idSolicitud);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Detalle de solicitud obtenido exitosamente', resultado);
  }

  @Patch(':idSolicitud/aprobar')
  @ApiOperation({ summary: 'Aprobar solicitud de cancelación', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiBody({ type: ProcesarSolicitudCancelacionRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Solicitud de cancelación aprobada exitosamente' })
  async aprobar(
    @Param('idSolicitud', ParseUUIDPipe) idSolicitud: string,
    @IdUsuarioActual() idUsuarioWeb: string,
    @Body() entrada: ProcesarSolicitudCancelacionRequestDto,
  ): Promise<RespuestaBaseDto<null>> {
    await this.procesarSolicitudUseCase.ejecutar(idSolicitud, idUsuarioWeb, entrada);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Solicitud de cancelación aprobada exitosamente');
  }
}
