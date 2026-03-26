import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { ReporteDetalleAlertaUseCase } from '@/reportes/aplicacion/casos-uso/reporte-detalle-alerta.use-case';
import { ReporteHistorialAlertasUseCase } from '@/reportes/aplicacion/casos-uso/reporte-historial-alertas.use-case';
import { ReporteHistorialVictimaUseCase } from '@/reportes/aplicacion/casos-uso/reporte-historial-victima.use-case';
import { ReporteSolicitudesCancelacionUseCase } from '@/reportes/aplicacion/casos-uso/reporte-solicitudes-cancelacion.use-case';
import { ReporteHistorialAlertasQueryDto } from '@/reportes/presentacion/dto/reporte-historial-alertas-query.dto';
import { ReporteSolicitudesCancelacionQueryDto } from '@/reportes/presentacion/dto/reporte-solicitudes-cancelacion-query.dto';
@ApiTags('REPORTES')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('reportes')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.INVESTIGADOR, RolesPermitidos.OPERADOR)
export class ReportesController {
  constructor(
    private readonly reporteHistorialAlertasUseCase: ReporteHistorialAlertasUseCase,
    private readonly reporteDetalleAlertaUseCase: ReporteDetalleAlertaUseCase,
    private readonly reporteHistorialVictimaUseCase: ReporteHistorialVictimaUseCase,
    private readonly reporteSolicitudesCancelacionUseCase: ReporteSolicitudesCancelacionUseCase,
  ) {}

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Generar reporte PDF del historial de alertas', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiProduces('application/pdf')
  async reporteHistorialAlertas(@Query() filtros: ReporteHistorialAlertasQueryDto, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteHistorialAlertasUseCase.ejecutar(filtros);
    this.enviarPdf(res, buffer, 'reporte-historial-alertas.pdf');
  }

  @Get('alertas/:idAlerta/detalle')
  @ApiOperation({ summary: 'Generar reporte PDF del detalle de una alerta', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiProduces('application/pdf')
  async reporteDetalleAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteDetalleAlertaUseCase.ejecutar(idAlerta);
    this.enviarPdf(res, buffer, `reporte-alerta-${idAlerta}.pdf`);
  }

  @Get('victimas/:idVictima/historial-alertas')
  @ApiOperation({ summary: 'Generar reporte PDF del historial de alertas de una víctima', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiProduces('application/pdf')
  async reporteHistorialVictima(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteHistorialVictimaUseCase.ejecutar({ idVictima });
    this.enviarPdf(res, buffer, 'reporte-historial-victima.pdf');
  }

  @Get('solicitudes-cancelacion')
  @ApiOperation({ summary: 'Generar reporte PDF de solicitudes de cancelación', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR, OPERADOR' })
  @ApiProduces('application/pdf')
  async reporteSolicitudesCancelacion(@Query() filtros: ReporteSolicitudesCancelacionQueryDto, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteSolicitudesCancelacionUseCase.ejecutar(filtros);
    this.enviarPdf(res, buffer, 'reporte-solicitudes-cancelacion.pdf');
  }

  private enviarPdf(res: Response, buffer: Buffer, nombreArchivo: string): void {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${nombreArchivo}"`,
      'Content-Length': buffer.length,
    });
    res.status(HttpStatus.OK).end(buffer);
  }
}
