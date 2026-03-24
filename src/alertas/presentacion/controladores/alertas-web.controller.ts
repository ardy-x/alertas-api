import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MarcarEnAtencionUseCase } from '@/alertas/aplicacion/casos-uso/atenciones/marcar-en-atencion.use-case';
import { ListarAlertasActivasUseCase } from '@/alertas/aplicacion/casos-uso/listar-alertas-activas.use-case';
import { ListarHistorialAlertasUseCase } from '@/alertas/aplicacion/casos-uso/listar-historial-alertas.use-case';
import { ObtenerAlertaPorIdUseCase } from '@/alertas/aplicacion/casos-uso/obtener-detalle-alerta.use-case';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { AlertasPaginacionQueryDto, FiltrosAlertasActivasRequestDto } from '../dto/entrada/alertas-entrada.dto';
import { RegistrarLlegadaRequestDto } from '../dto/entrada/atenciones-entrada.dto';
import { AlertaActivaDto, AlertaDetalleDto, ObtenerHistorialAlertasResponseDto } from '../dto/salida/alertas-salida.dto';

@ApiTags('ALERTAS WEB')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('alertas')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
export class AlertasWebController {
  constructor(
    private readonly obtenerAlertasActivasUseCase: ListarAlertasActivasUseCase,
    private readonly obtenerHistorialAlertasUseCase: ListarHistorialAlertasUseCase,
    private readonly obtenerAlertaPorIdUseCase: ObtenerAlertaPorIdUseCase,
    private readonly marcarEnAtencionUseCase: MarcarEnAtencionUseCase,
  ) {}

  @Get('alertas-activas')
  @Roles(RolesPermitidos.OPERADOR)
  @ApiOperation({ summary: 'Obtener alertas activas', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alertas activas obtenidas exitosamente', type: [AlertaActivaDto] })
  async obtenerAlertasActivas(@Query() filtros: FiltrosAlertasActivasRequestDto): Promise<RespuestaBaseDto<AlertaActivaDto[]>> {
    const resultado = await this.obtenerAlertasActivasUseCase.ejecutar(filtros);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alertas activas obtenidas exitosamente', resultado.alertas);
  }

  @Get('historial-alertas')
  @Roles(RolesPermitidos.OPERADOR)
  @ApiOperation({ summary: 'Obtener historial de alertas finalizadas', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Historial de alertas obtenido exitosamente', type: ObtenerHistorialAlertasResponseDto })
  async obtenerHistorialAlertas(@Query() paginacionDto: AlertasPaginacionQueryDto): Promise<RespuestaBaseDto<ObtenerHistorialAlertasResponseDto>> {
    const resultado = await this.obtenerHistorialAlertasUseCase.ejecutar(paginacionDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', resultado);
  }

  @Get(':idAlerta/detalle')
  @Roles(RolesPermitidos.OPERADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Obtener detalle de una alerta', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR, INVESTIGADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alerta obtenida exitosamente', type: AlertaDetalleDto })
  async obtenerAlertaPorId(@Param('idAlerta', ParseUUIDPipe) idAlerta: string): Promise<RespuestaBaseDto<AlertaDetalleDto>> {
    const resultado = await this.obtenerAlertaPorIdUseCase.ejecutar(idAlerta);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta obtenida exitosamente', resultado.alerta);
  }

  @Patch(':idAlerta/en-atencion')
  @Roles(RolesPermitidos.OPERADOR)
  @ApiOperation({ summary: 'Marcar alerta en atención', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiBody({ type: RegistrarLlegadaRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alerta marcada en atención exitosamente' })
  async marcarEnAtencion(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @IdUsuarioActual() idUsuarioWeb: string, @Body() body: RegistrarLlegadaRequestDto): Promise<RespuestaBaseDto> {
    await this.marcarEnAtencionUseCase.ejecutar(idAlerta, idUsuarioWeb, body.ciFuncionario);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta marcada en atención exitosamente');
  }
}
