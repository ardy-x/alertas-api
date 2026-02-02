import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerAlertasPorUbicacionUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-alertas-por-ubicacion.use-case';
import { ObtenerAlertasRecientesUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-alertas-recientes.use-case';
import { ObtenerEstadoSistemaUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-estado-sistema.use-case';
import { ObtenerMetricasGeneralesUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-metricas-generales.use-case';
import { ObtenerMetricasTiempoUseCase } from '@/dashboard/aplicacion/casos-uso/obtener-metricas-tiempo.use-case';

import { EstadoSistemaDto } from '../dto/estado-sistema.dto';

@ApiTags('DASHBOARD')
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly obtenerMetricasGeneralesUseCase: ObtenerMetricasGeneralesUseCase,
    private readonly obtenerAlertasPorUbicacionUseCase: ObtenerAlertasPorUbicacionUseCase,
    private readonly obtenerAlertasRecientesUseCase: ObtenerAlertasRecientesUseCase,
    private readonly obtenerMetricasTiempoUseCase: ObtenerMetricasTiempoUseCase,
    private readonly obtenerEstadoSistemaUseCase: ObtenerEstadoSistemaUseCase,
  ) {}

  @Get('metricas-generales')
  @ApiOperation({ summary: 'Obtener métricas generales del sistema' })
  async obtenerMetricasGenerales() {
    const metricas = await this.obtenerMetricasGeneralesUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Métricas obtenidas exitosamente', metricas);
  }

  @Get('alertas-geograficas')
  @ApiOperation({ summary: 'Obtener alertas por ubicación geográfica' })
  async obtenerAlertasPorUbicacion() {
    const alertas = await this.obtenerAlertasPorUbicacionUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alertas geográficas obtenidas exitosamente', alertas);
  }

  @Get('alertas-recientes')
  @ApiOperation({ summary: 'Obtener alertas recientes' })
  async obtenerAlertasRecientes(@Query('limite') limite?: string) {
    const limiteNum = limite ? parseInt(limite, 10) : 10;
    const alertas = await this.obtenerAlertasRecientesUseCase.ejecutar(limiteNum);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alertas recientes obtenidas exitosamente', alertas);
  }

  @Get('metricas-tiempo')
  @ApiOperation({ summary: 'Obtener métricas de tiempo de respuesta' })
  async obtenerMetricasTiempo() {
    const metricas = await this.obtenerMetricasTiempoUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Métricas de tiempo obtenidas exitosamente', metricas);
  }

  @Get('estado-sistema')
  @ApiOperation({ summary: 'Obtener estado del sistema' })
  @ApiResponse({ status: 200, type: EstadoSistemaDto })
  async obtenerEstadoSistema() {
    const estado = await this.obtenerEstadoSistemaUseCase.ejecutar();
    return RespuestaBuilder.exito(HttpStatus.OK, 'Estado del sistema obtenido exitosamente', estado);
  }
}
