import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ListarAlertasActivasUseCase } from '@/alertas/aplicacion/casos-uso/listar-alertas-activas.use-case';
import { ListarHistorialAlertasUseCase } from '@/alertas/aplicacion/casos-uso/listar-historial-alertas.use-case';
import { MarcarEnAtencionUseCase } from '@/alertas/aplicacion/casos-uso/marcar-en-atencion.use-case';
import { ObtenerAlertaPorIdUseCase } from '@/alertas/aplicacion/casos-uso/obtener-detalle-alerta.use-case';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { AlertasPaginacionQueryDto, FiltrosAlertasActivasRequestDto } from '../dto/entrada/alertas-entrada.dto';
import { RegistrarLlegadaRequestDto } from '../dto/entrada/atenciones-entrada.dto';
import { AlertaActivaDto, AlertaDetalleDto, ObtenerHistorialAlertasResponseDto } from '../dto/salida/alertas-salida.dto';

@ApiTags('ALERTAS WEB')
@Controller('alertas')
@ApiBearerAuth('kerberos-jwt-auth')
@UseGuards(KerberosJwtAuthGuard)
export class AlertasWebController {
  constructor(
    private readonly obtenerAlertasActivasUseCase: ListarAlertasActivasUseCase,
    private readonly obtenerHistorialAlertasUseCase: ListarHistorialAlertasUseCase,
    private readonly obtenerAlertaPorIdUseCase: ObtenerAlertaPorIdUseCase,
    private readonly marcarEnAtencionUseCase: MarcarEnAtencionUseCase,
  ) {}

  @Get('alertas-activas')
  @ApiOperation({ summary: 'Obtener alertas activas' })
  async obtenerAlertasActivas(@Query() filtros: FiltrosAlertasActivasRequestDto): Promise<RespuestaBaseDto<AlertaActivaDto[]>> {
    const resultado = await this.obtenerAlertasActivasUseCase.ejecutar(filtros);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alertas activas obtenidas exitosamente', resultado.alertas);
  }

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Obtener historial de alertas finalizadas' })
  async obtenerHistorialAlertas(@Query() paginacionDto: AlertasPaginacionQueryDto): Promise<RespuestaBaseDto<ObtenerHistorialAlertasResponseDto>> {
    const resultado = await this.obtenerHistorialAlertasUseCase.ejecutar(paginacionDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', resultado);
  }

  @Get(':idAlerta/detalle')
  @ApiOperation({ summary: 'Obtener alerta por ID' })
  async obtenerAlertaPorId(@Param('idAlerta', ParseUUIDPipe) idAlerta: string): Promise<RespuestaBaseDto<AlertaDetalleDto>> {
    const resultado = await this.obtenerAlertaPorIdUseCase.ejecutar(idAlerta);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta obtenida exitosamente', resultado.alerta);
  }

  @Patch(':idAlerta/en-atencion')
  @ApiOperation({ summary: 'Marcar alerta en atención' })
  @ApiBody({ type: RegistrarLlegadaRequestDto })
  async marcarEnAtencion(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @IdUsuarioActual() idUsuarioWeb: string, @Body() body: RegistrarLlegadaRequestDto): Promise<RespuestaBaseDto> {
    await this.marcarEnAtencionUseCase.ejecutar(idAlerta, idUsuarioWeb, body.ciFuncionario, body.fechaLlegada);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta marcada en atención exitosamente');
  }
}
