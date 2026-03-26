import { Injectable } from '@nestjs/common';

import { ObtenerAlertaPorIdUseCase } from '@/alertas/aplicacion/casos-uso/obtener-detalle-alerta.use-case';
import { EstadoSolicitudCancelacion } from '@/alertas/dominio/enums/alerta-enums';
import { EventoDto, FuncionarioAsignadoDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { MetadatoPar, PdfGeneratorService, TablaColumna } from '@/reportes/infraestructura/generadores/pdf-generator.service';
import { formatearFechaBoliviaCompleta, formatearFechaBoliviaSoloFecha, formatearFechaBoliviaSoloHora } from '@/utils/fecha.utils';

@Injectable()
export class ReporteDetalleAlertaUseCase {
  constructor(
    private readonly obtenerAlertaPorIdUseCase: ObtenerAlertaPorIdUseCase,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async ejecutar(idAlerta: string): Promise<Buffer> {
    const { alerta } = await this.obtenerAlertaPorIdUseCase.ejecutar(idAlerta);

    const doc = this.pdfGenerator.crearDocumento({ size: 'LETTER', layout: 'portrait' });
    const fechaFormateada = formatearFechaBoliviaSoloFecha(alerta.fechaHora);
    const horaFormateada = formatearFechaBoliviaSoloHora(alerta.fechaHora);

    this.pdfGenerator.agregarEncabezado(doc, 'Detalle de Alerta', 'Sistema de Alertas Adela Zamudio');

    // Metadatos principales
    const ubicacion = [alerta.departamento, alerta.provincia, alerta.municipio].filter(Boolean).join(' / ') || '—';
    const metadatos: MetadatoPar[] = [
      ['CÓD. CUD', alerta.codigoCud ?? '—', 'ESTADO', alerta.estadoAlerta],
      ['FECHA ACTIVACIÓN', fechaFormateada, 'HORA', horaFormateada],
      ['ORIGEN', alerta.origen, 'UBICACIÓN', ubicacion],
    ];
    this.pdfGenerator.agregarMetadatos(doc, metadatos);

    // — Víctima —
    if (alerta.victima) {
      this.pdfGenerator.agregarSeccion(doc, 'Datos de la Víctima');
      const edad = alerta.victima.fechaNacimiento ? this.calcularEdad(alerta.victima.fechaNacimiento) : '—';
      const metVictima: MetadatoPar[] = [
        ['NOMBRE COMPLETO', alerta.victima.nombreCompleto ?? '—', 'CÉDULA DE IDENTIDAD', alerta.victima.cedulaIdentidad ?? '—'],
        ['EDAD', `${edad} años`, 'CELULAR', alerta.victima.celular ?? '—'],
        ['CORREO ELECTRÓNICO', alerta.victima.correo ?? '—', 'FECHA NACIMIENTO', alerta.victima.fechaNacimiento ? formatearFechaBoliviaSoloFecha(alerta.victima.fechaNacimiento) : '—'],
        ['DIRECCIÓN', alerta.victima.direccionDomicilio ?? '—', '', ''],
      ];
      this.pdfGenerator.agregarMetadatos(doc, metVictima);
    }

    // — Atención —
    if (alerta.atencion) {
      this.pdfGenerator.agregarSeccion(doc, 'Recursos y Personal Policial Asignado');
      const despachador = alerta.atencion.usuarioWeb ? `${alerta.atencion.usuarioWeb.grado ?? ''} ${alerta.atencion.usuarioWeb.nombreCompleto ?? ''}`.trim() || '—' : '—';
      const metAtencion: MetadatoPar[] = [
        ['CÓDIGO VEHÍCULO', alerta.atencion.siglaVehiculo, 'CÓDIGO RADIO', alerta.atencion.siglaRadio],
        ['USUARIO DESPACHADOR', despachador, '', ''],
      ];
      this.pdfGenerator.agregarMetadatos(doc, metAtencion);

      if (alerta.atencion.atencionFuncionario?.length) {
        alerta.atencion.atencionFuncionario.forEach((f: FuncionarioAsignadoDto, i) => {
          this.pdfGenerator.agregarSubtitulo(doc, `N\u00b0 ${i + 1}`);
          const nombreConGrado = `${f.grado ?? ''} ${f.nombreCompleto ?? ''}`.trim() || '—';
          const datos: MetadatoPar[] = [
            ['NOMBRE', nombreConGrado, 'ROL', f.rolAtencion ?? '—'],
            ['UNIDAD', f.unidad ?? '—', 'FECHA LLEGADA', f.fechaLlegada ? formatearFechaBoliviaCompleta(f.fechaLlegada) : 'NO'],
          ];
          this.pdfGenerator.agregarMetadatos(doc, datos);
        });
      }
    }

    // — Solicitud de Cancelación —
    if (alerta.solicitudesCancelacion) {
      this.pdfGenerator.agregarSeccion(doc, 'Solicitud de Cancelación');
      const solicitud = alerta.solicitudesCancelacion;

      const metSolicitud: MetadatoPar[] = [['ESTADO SOLICITUD', solicitud.estadoSolicitud, 'FECHA SOLICITUD', formatearFechaBoliviaCompleta(solicitud.fechaSolicitud)]];

      // Si fue APROBADA, mostrar usuario que aprobó
      if (solicitud.estadoSolicitud === EstadoSolicitudCancelacion.APROBADA && solicitud.usuarioWeb) {
        const usuarioAprobador = `${solicitud.usuarioWeb.grado} ${solicitud.usuarioWeb.nombreCompleto}`;
        metSolicitud.push(['USUARIO QUE APROBÓ', usuarioAprobador, '', '']);

        if (solicitud.motivoCancelacion) {
          metSolicitud.push(['MOTIVO', solicitud.motivoCancelacion, '', '']);
        }
      }

      // Si fue RECHAZADA, fue el sistema quien rechazó automáticamente
      if (solicitud.estadoSolicitud === EstadoSolicitudCancelacion.RECHAZADA) {
        metSolicitud.push(['RECHAZADO POR', 'Sistema (Rechazo automático)', '', '']);
      }

      this.pdfGenerator.agregarMetadatos(doc, metSolicitud);
    }

    // — Cierre —
    if (alerta.cierre) {
      this.pdfGenerator.agregarSeccion(doc, 'Información de Cierre');
      const metCierre: MetadatoPar[] = [
        ['MOTIVO CIERRE', alerta.cierre.motivoCierre, 'FECHA Y HORA', formatearFechaBoliviaCompleta(alerta.cierre.fechaHora)],
        ['ESTADO VÍCTIMA', alerta.cierre.estadoVictima, '', ''],
        ['OBSERVACIONES', alerta.cierre.observaciones ?? '—', '', ''],
      ];
      this.pdfGenerator.agregarMetadatos(doc, metCierre);

      if (alerta.cierre.agresores?.length) {
        doc.font('Helvetica-Bold').fontSize(9).text('AGRESORES IDENTIFICADOS:', 35);
        const colsAgresores: TablaColumna[] = [
          { header: 'NRO', width: 40, align: 'center' },
          { header: 'CÉDULA DE IDENTIDAD', width: 120, align: 'center' },
          { header: 'NOMBRE COMPLETO', width: 280 },
          { header: 'PARENTESCO', width: 252 },
        ];
        const filasAgresores = alerta.cierre.agresores.map((a, i) => [String(i + 1), a.cedulaIdentidad, a.nombreCompleto, a.parentesco]);
        this.pdfGenerator.agregarTabla(doc, colsAgresores, filasAgresores);
      }
    }

    // — Eventos —
    if (alerta.eventos?.length) {
      this.pdfGenerator.agregarSeccion(doc, 'Historial de Eventos');
      const colsEventos: TablaColumna[] = [
        { header: 'NRO', width: 40, align: 'center' },
        { header: 'TIPO DE EVENTO', width: 352 },
        { header: 'FECHA Y HORA', width: 300, align: 'center' },
      ];
      const filasEventos = alerta.eventos.map((e: EventoDto, i) => [String(i + 1), this.obtenerTituloEvento(e.tipoEvento), formatearFechaBoliviaCompleta(e.fechaHora)]);
      this.pdfGenerator.agregarTabla(doc, colsEventos, filasEventos);
    }

    this.pdfGenerator.agregarPieDePagina(doc, 1, 1);
    return this.pdfGenerator.finalizar(doc);
  }

  private calcularEdad(fechaNacimiento: Date | string): string {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad.toString();
  }

  private obtenerTituloEvento(tipoEvento: string): string {
    switch (tipoEvento) {
      case 'ALERTA_RECIBIDA':
        return 'Esta alerta de emergencia llegó al sistema';
      case 'ALERTA_ASIGNADA':
        return 'Se asignó personal policial para atender esta alerta';
      case 'CONTACTO_FAMILIARES':
        return 'Se contactó a la familia de la víctima';
      case 'ATENCION_VICTIMA':
        return 'Se tomó contacto con víctima en el lugar';
      case 'ALERTA_CERRADA':
        return 'Esta alerta de emergencia se resolvió por completo';
      case 'ALERTA_CANCELADA':
        return 'Esta alerta fue cancelada';
      case 'FALSA_ALERTA':
        return 'Esta alerta resultó ser una falsa alarma';
      default:
        return tipoEvento.toLowerCase().replace('_', ' ');
    }
  }
}
