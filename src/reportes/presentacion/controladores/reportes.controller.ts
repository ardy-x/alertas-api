import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { ReporteDetalleAlertaUseCase } from '@/reportes/aplicacion/casos-uso/reporte-detalle-alerta.use-case';
import { ReporteHistorialAlertasUseCase } from '@/reportes/aplicacion/casos-uso/reporte-historial-alertas.use-case';
import { ReporteHistorialVictimaUseCase } from '@/reportes/aplicacion/casos-uso/reporte-historial-victima.use-case';
import { ReporteHistorialAlertasQueryDto } from '@/reportes/presentacion/dto/reporte-historial-alertas-query.dto';
@ApiTags('REPORTES')
@Controller('reportes')
@ApiBearerAuth('kerberos-jwt-auth')
@UseGuards(KerberosJwtAuthGuard)
export class ReportesController {
  constructor(
    private readonly reporteHistorialAlertasUseCase: ReporteHistorialAlertasUseCase,
    private readonly reporteDetalleAlertaUseCase: ReporteDetalleAlertaUseCase,
    private readonly reporteHistorialVictimaUseCase: ReporteHistorialVictimaUseCase,
  ) {}

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Generar reporte PDF del historial de alertas' })
  @ApiProduces('application/pdf')
  async reporteHistorialAlertas(@Query() filtros: ReporteHistorialAlertasQueryDto, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteHistorialAlertasUseCase.ejecutar(filtros);
    this.enviarPdf(res, buffer, 'reporte-historial-alertas.pdf');
  }

  @Get('alertas/:idAlerta/detalle')
  @ApiOperation({ summary: 'Generar reporte PDF del detalle de una alerta' })
  @ApiProduces('application/pdf')
  async reporteDetalleAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteDetalleAlertaUseCase.ejecutar(idAlerta);
    this.enviarPdf(res, buffer, `reporte-alerta-${idAlerta}.pdf`);
  }

  @Get('victimas/:idVictima/historial-alertas')
  @ApiOperation({ summary: 'Generar reporte PDF del historial de alertas de una víctima' })
  @ApiProduces('application/pdf')
  async reporteHistorialVictima(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Res() res: Response): Promise<void> {
    const buffer = await this.reporteHistorialVictimaUseCase.ejecutar({ idVictima });
    this.enviarPdf(res, buffer, 'reporte-historial-victima.pdf');
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
