import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerAlertasPorUbicacionUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-alertas-por-ubicacion.use-case';
import { ObtenerDistribucionEstadosUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-distribucion-estados.use-case';
import { ObtenerEstadoSistemaUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-estado-sistema.use-case';
import { ObtenerMapaCalorUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-mapa-calor.use-case';
import { ObtenerMetricasGeneralesUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-metricas-generales.use-case';
import { ObtenerPatronHorarioUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-patron-horario.use-case';
import { AlertaPorDepartamentoDto, MetricasGeneralesDto } from '../dto/dashboard.dto';
import { DistribucionEstadosDto } from '../dto/distribucion-estados.dto';
import { EstadoSistemaDto } from '../dto/estado-sistema.dto';
import { MapaCalorQueryDto } from '../dto/mapa-calor-query.dto';
import { PatronHorarioDto } from '../dto/patron-horario.dto';

@ApiTags('DASHBOARD')
@Controller('dashboard')
@UseGuards(KerberosJwtAuthGuard)
@ApiSecurity('jwt-auth')
export class DashboardController {
  constructor(
    private readonly obtenerMetricasGeneralesUseCase: ObtenerMetricasGeneralesUseCase,
    private readonly obtenerAlertasPorUbicacionUseCase: ObtenerAlertasPorUbicacionUseCase,
    private readonly obtenerEstadoSistemaUseCase: ObtenerEstadoSistemaUseCase,
    private readonly obtenerDistribucionEstadosUseCase: ObtenerDistribucionEstadosUseCase,
    private readonly obtenerPatronHorarioUseCase: ObtenerPatronHorarioUseCase,
    private readonly obtenerMapaCalorUseCase: ObtenerMapaCalorUseCase,
  ) {}

  @Get('metricas-generales')
  @ApiOperation({ summary: 'Obtener métricas generales del sistema' })
  @ApiResponse({ status: 200, type: MetricasGeneralesDto })
  async obtenerMetricasGenerales() {
    const metricas = await this.obtenerMetricasGeneralesUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Métricas obtenidas exitosamente', metricas);
  }

  @Get('alertas-geograficas')
  @ApiOperation({ summary: 'Obtener alertas por departamento' })
  @ApiResponse({ status: 200, type: [AlertaPorDepartamentoDto] })
  async obtenerAlertasPorUbicacion() {
    const alertas = await this.obtenerAlertasPorUbicacionUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alertas por departamento obtenidas exitosamente', alertas);
  }

  @Get('estado-sistema')
  @ApiOperation({ summary: 'Obtener estado del sistema' })
  @ApiResponse({ status: 200, type: EstadoSistemaDto })
  async obtenerEstadoSistema() {
    const estado = await this.obtenerEstadoSistemaUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Estado del sistema obtenido exitosamente', estado);
  }

  @Get('distribucion-estados')
  @ApiOperation({ summary: 'Obtener distribución de alertas por estado' })
  @ApiResponse({ status: 200, type: DistribucionEstadosDto })
  async obtenerDistribucionEstados() {
    const distribucion = await this.obtenerDistribucionEstadosUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Distribución de estados obtenida exitosamente', distribucion);
  }

  @Get('patron-horario')
  @ApiOperation({ summary: 'Obtener patrón horario de alertas (7 días × 24 horas)' })
  @ApiResponse({ status: 200, type: PatronHorarioDto })
  async obtenerPatronHorario() {
    const patron = await this.obtenerPatronHorarioUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Patrón horario obtenido exitosamente', patron);
  }

  @Get('mapa-calor')
  @ApiOperation({ summary: 'Obtener alertas en formato GeoJSON para mapa con clustering' })
  async obtenerMapaCalor(@Query() query: MapaCalorQueryDto) {
    const mapaCalor = await this.obtenerMapaCalorUseCase.ejecutar(query.idDepartamento, query.idProvincia, query.idMunicipio);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Mapa de calor obtenido exitosamente', mapaCalor);
  }
}
