import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActualizarAlertaUseCase } from '@/alertas/aplicacion/casos-uso/actualizar-alerta.use-case';
import { CrearAlertaUseCase } from '@/alertas/aplicacion/casos-uso/crear-alerta.use-case';
import { ObtenerEstadoAlertaUseCase } from '@/alertas/aplicacion/casos-uso/obtener-estado-alerta.use-case';
import { CrearSolicitudUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/crear-solicitud.use-case';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ClaveApiGuard } from '@/victimas/infraestructura/guards/clave-api.guard';

import { ActualizarAlertaRequestDto, CrearAlertaRequestDto } from '../dto/entrada/alertas-entrada.dto';
import { CrearSolicitudCancelacionRequestDto } from '../dto/entrada/solicitudes-cancelacion-entrada.dto';
import { CrearAlertaResponseDto } from '../dto/salida/alertas-salida.dto';

@ApiTags('ALERTAS')
@Controller('alertas')
@UseGuards(ClaveApiGuard)
export class AlertasController {
  constructor(
    private readonly crearAlertaUseCase: CrearAlertaUseCase,
    private readonly actualizarAlertaUseCase: ActualizarAlertaUseCase,
    private readonly obtenerEstadoAlertaUseCase: ObtenerEstadoAlertaUseCase,
    private readonly crearSolicitudCancelacionUseCase: CrearSolicitudUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva alerta' })
  @ApiBody({ type: CrearAlertaRequestDto })
  async crearAlerta(@Body() dto: CrearAlertaRequestDto): Promise<RespuestaBaseDto<CrearAlertaResponseDto>> {
    const datos = await this.crearAlertaUseCase.ejecutar(dto);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Alerta creada exitosamente', datos);
  }

  @Patch(':idAlerta')
  @ApiOperation({ summary: 'Actualizar ubicación de una alerta' })
  @ApiBody({ type: ActualizarAlertaRequestDto })
  async actualizarAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @Body() actualizarAlertaDto: ActualizarAlertaRequestDto): Promise<RespuestaBaseDto> {
    await this.actualizarAlertaUseCase.ejecutar(idAlerta, actualizarAlertaDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Ubicación de alerta actualizada exitosamente');
  }

  @Get(':idAlerta/estado')
  @ApiOperation({ summary: 'Obtener estado de una alerta' })
  async obtenerEstadoAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string): Promise<RespuestaBaseDto<string>> {
    const resultado = await this.obtenerEstadoAlertaUseCase.ejecutar(idAlerta);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Estado de alerta obtenido exitosamente', resultado.estadoAlerta);
  }

  @Post(':idAlerta/solicitudes-cancelacion')
  @ApiOperation({ summary: 'Crear solicitud de cancelación para una alerta' })
  @ApiBody({ type: CrearSolicitudCancelacionRequestDto })
  async crearSolicitudCancelacion(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @Body() dto: CrearSolicitudCancelacionRequestDto): Promise<RespuestaBaseDto> {
    await this.crearSolicitudCancelacionUseCase.ejecutar(idAlerta, dto);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Solicitud de cancelación creada exitosamente');
  }
}
