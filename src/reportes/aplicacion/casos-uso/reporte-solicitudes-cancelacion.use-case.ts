import { Injectable } from '@nestjs/common';

import { ListarSolicitudesUseCase } from '@/alertas/aplicacion/casos-uso/solicitudes-cancelacion/listar-solicitudes.use-case';
import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { SolicitudCancelacionListadoDto } from '@/alertas/presentacion/dto/salida/solicitudes-cancelacion-salida.dto';
import { MetadatoPar, PdfGeneratorService, TablaColumna } from '@/reportes/infraestructura/generadores/pdf-generator.service';
import { ReporteSolicitudesCancelacionQueryDto } from '@/reportes/presentacion/dto/reporte-solicitudes-cancelacion-query.dto';
import { convertirFechaBoliviaFinalDelDiaAUTC, convertirFechaBoliviaInicioDelDiaAUTC, formatearFechaSimple, obtenerRangoMesesLiteral, separarFechaHoraBolivia } from '@/utils/fecha.utils';

@Injectable()
export class ReporteSolicitudesCancelacionUseCase {
  constructor(
    private readonly listarSolicitudesUseCase: ListarSolicitudesUseCase,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async ejecutar(filtros: ReporteSolicitudesCancelacionQueryDto): Promise<Buffer> {
    // Convertir fechas de hora local Bolivia a UTC para consulta en BD
    const fechaDesdeUTC = convertirFechaBoliviaInicioDelDiaAUTC(filtros.fechaDesde);
    const fechaHastaUTC = convertirFechaBoliviaFinalDelDiaAUTC(filtros.fechaHasta);

    const datos = await this.listarSolicitudesUseCase.ejecutar({
      idDepartamento: filtros.idDepartamento,
      fechaDesde: fechaDesdeUTC.toISOString(),
      fechaHasta: fechaHastaUTC.toISOString(),
      estado: [filtros.estado as EstadoSolicitudCancelacion],
      pagina: 1,
      elementosPorPagina: filtros.elementosPorPagina,
    });

    const doc = this.pdfGenerator.crearDocumento();
    const total = datos.paginacion?.totalElementos ?? datos.solicitudes.length;
    const nombreDepartamento = datos.solicitudes[0]?.departamento ?? (filtros.idDepartamento ? `ID ${filtros.idDepartamento}` : 'TODOS');

    // Formatear fechas para mostrar en el reporte (usar las fechas originales del filtro)
    const fechaDesdeFormateada = formatearFechaSimple(filtros.fechaDesde);
    const fechaHastaFormateada = formatearFechaSimple(filtros.fechaHasta);
    const rangoFechas = `Del: ${fechaDesdeFormateada} Al: ${fechaHastaFormateada}`;

    // Calcular mes literal basado en el rango de fechas
    const mesLiteral = obtenerRangoMesesLiteral(filtros.fechaDesde, filtros.fechaHasta);

    this.pdfGenerator.agregarEncabezado(doc, 'Solicitudes de Cancelación', 'Sistema de Alertas Adela Zamudio', rangoFechas);

    const metadatos: MetadatoPar[] = [
      ['DEPARTAMENTO', nombreDepartamento, 'MES', mesLiteral],
      ['ESTADO', filtros.estado, 'TOTAL DE SOLICITUDES', String(total)],
    ];
    this.pdfGenerator.agregarMetadatos(doc, metadatos);

    const columnas: TablaColumna[] = [
      { header: 'NRO', width: 40, align: 'center' },
      { header: 'FECHA', width: 80, align: 'center' },
      { header: 'HORA', width: 60, align: 'center' },
      { header: 'C.I.', width: 80, align: 'center' },
      { header: 'NOMBRE COMPLETO', width: 200 },
      { header: 'ESTADO', width: 100, align: 'center' },
      { header: 'MUNICIPIO', width: 130 },
      { header: 'PROVINCIA', width: 130 },
    ];

    const filas = datos.solicitudes.map((solicitud: SolicitudCancelacionListadoDto, idx) => {
      const [fecha, hora] = separarFechaHoraBolivia(solicitud.fechaSolicitud);
      return [
        String(idx + 1),
        fecha,
        hora,
        solicitud.victima?.cedulaIdentidad ?? '—',
        solicitud.victima?.nombreCompleto ?? '—',
        solicitud.estadoSolicitud,
        solicitud.municipio ?? '—',
        solicitud.provincia ?? '—',
      ];
    });

    this.pdfGenerator.agregarTabla(doc, columnas, filas);
    this.pdfGenerator.agregarPieDePagina(doc, 1, 1);

    return this.pdfGenerator.finalizar(doc);
  }
}
