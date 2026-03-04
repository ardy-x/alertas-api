import { Module } from '@nestjs/common';

import { AlertasModule } from '@/alertas/alertas.module';
import { VictimasModule } from '@/victimas/victimas.module';
import { ReporteDetalleAlertaUseCase } from './aplicacion/casos-uso/reporte-detalle-alerta.use-case';
import { ReporteHistorialAlertasUseCase } from './aplicacion/casos-uso/reporte-historial-alertas.use-case';
import { ReporteHistorialVictimaUseCase } from './aplicacion/casos-uso/reporte-historial-victima.use-case';
import { PdfGeneratorService } from './infraestructura/generadores/pdf-generator.service';
import { ReportesController } from './presentacion/controladores/reportes.controller';

@Module({
  imports: [AlertasModule, VictimasModule],
  controllers: [ReportesController],
  providers: [PdfGeneratorService, ReporteHistorialAlertasUseCase, ReporteDetalleAlertaUseCase, ReporteHistorialVictimaUseCase],
})
export class ReportesModule {}
