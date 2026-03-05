import { Injectable } from '@nestjs/common';

import { ListarHistorialAlertasUseCase } from '@/alertas/aplicacion/casos-uso/listar-historial-alertas.use-case';
import { AlertaHistorialDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { MetadatoPar, PdfGeneratorService, TablaColumna } from '@/reportes/infraestructura/generadores/pdf-generator.service';
import { ReporteHistorialAlertasQueryDto } from '@/reportes/presentacion/dto/reporte-historial-alertas-query.dto';
import { convertirFechaBoliviaFinalDelDiaAUTC, convertirFechaBoliviaInicioDelDiaAUTC, formatearFechaSimple, obtenerRangoMesesLiteral } from '@/utils/fecha.utils';

@Injectable()
export class ReporteHistorialAlertasUseCase {
  constructor(
    private readonly listarHistorialAlertasUseCase: ListarHistorialAlertasUseCase,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async ejecutar(filtros: ReporteHistorialAlertasQueryDto): Promise<Buffer> {
    // Convertir fechas de hora local Bolivia a UTC para consulta en BD
    const fechaDesdeUTC = convertirFechaBoliviaInicioDelDiaAUTC(filtros.fechaDesde);
    const fechaHastaUTC = convertirFechaBoliviaFinalDelDiaAUTC(filtros.fechaHasta);

    const datos = await this.listarHistorialAlertasUseCase.ejecutar({
      idDepartamento: filtros.idDepartamento,
      fechaDesde: fechaDesdeUTC.toISOString(),
      fechaHasta: fechaHastaUTC.toISOString(),
      estadoAlerta: [filtros.estadoAlerta],
      pagina: 1,
      elementosPorPagina: filtros.elementosPorPagina,
    });

    const doc = this.pdfGenerator.crearDocumento();
    const total = datos.paginacion?.totalElementos ?? datos.historial.length;
    const nombreDepartamento = datos.historial[0]?.departamento ?? (filtros.idDepartamento ? `ID ${filtros.idDepartamento}` : 'TODOS');

    // Formatear fechas para mostrar en el reporte (usar las fechas originales del filtro)
    const fechaDesdeFormateada = formatearFechaSimple(filtros.fechaDesde);
    const fechaHastaFormateada = formatearFechaSimple(filtros.fechaHasta);
    const rangoFechas = `Del: ${fechaDesdeFormateada} Al: ${fechaHastaFormateada}`;

    // Calcular mes literal basado en el rango de fechas
    const mesLiteral = obtenerRangoMesesLiteral(filtros.fechaDesde, filtros.fechaHasta);

    this.pdfGenerator.agregarEncabezado(doc, 'Historial de Alertas', 'Sistema de Alertas Adela Zamudio', rangoFechas);

    const metadatos: MetadatoPar[] = [
      ['DEPARTAMENTO', nombreDepartamento, 'MES', mesLiteral],
      ['ESTADO ALERTA', filtros.estadoAlerta, 'TOTAL DE ALERTAS', String(total)],
    ];
    this.pdfGenerator.agregarMetadatos(doc, metadatos);

    const columnas: TablaColumna[] = [
      { header: 'NRO', width: 40, align: 'center' },
      { header: 'FECHA', width: 80, align: 'center' },
      { header: 'HORA', width: 60, align: 'center' },
      { header: 'CÓD. CUD', width: 100, align: 'center' },
      { header: 'C.I.', width: 80, align: 'center' },
      { header: 'NOMBRE COMPLETO', width: 220 },
      { header: 'MUNICIPIO', width: 130 },
      { header: 'PROVINCIA', width: 130 },
    ];

    const filas = datos.historial.map((alerta: AlertaHistorialDto, idx) => {
      const [fecha, hora] = this.separarFechaHora(alerta.fechaHora);
      return [String(idx + 1), fecha, hora, alerta.codigoCud ?? '—', alerta.victima?.cedulaIdentidad ?? '—', alerta.victima?.nombreCompleto ?? '—', alerta.municipio ?? '—', alerta.provincia ?? '—'];
    });

    this.pdfGenerator.agregarTabla(doc, columnas, filas);
    this.pdfGenerator.agregarPieDePagina(doc, 1, 1);

    return this.pdfGenerator.finalizar(doc);
  }

  private separarFechaHora(fecha: Date | string | undefined): [string, string] {
    if (!fecha) return ['—', '—'];
    const date = new Date(fecha);
    const fechaStr = date.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaStr = date.toLocaleTimeString('es-BO', { timeZone: 'America/La_Paz', hour: '2-digit', minute: '2-digit' });
    return [fechaStr, horaStr];
  }
}
