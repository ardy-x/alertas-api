import { Injectable } from '@nestjs/common';

import { ObtenerAlertaPorIdUseCase } from '@/alertas/aplicacion/casos-uso/obtener-detalle-alerta.use-case';
import { EventoDto, FuncionarioAsignadoDto } from '@/alertas/presentacion/dto/salida/alertas-salida.dto';
import { MetadatoPar, PdfGeneratorService, TablaColumna } from '@/reportes/infraestructura/generadores/pdf-generator.service';

@Injectable()
export class ReporteDetalleAlertaUseCase {
  constructor(
    private readonly obtenerAlertaPorIdUseCase: ObtenerAlertaPorIdUseCase,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async ejecutar(idAlerta: string): Promise<Buffer> {
    const { alerta } = await this.obtenerAlertaPorIdUseCase.ejecutar(idAlerta);

    const doc = this.pdfGenerator.crearDocumento({ size: 'LETTER', layout: 'portrait' });
    const fechaAlerta = new Date(alerta.fechaHora);
    const fechaFormateada = fechaAlerta.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/La_Paz' });
    const horaFormateada = fechaAlerta.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/La_Paz' });

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
        ['CORREO ELECTRÓNICO', alerta.victima.correo ?? '—', 'FECHA NACIMIENTO', alerta.victima.fechaNacimiento ? this.formatearFechaSolo(alerta.victima.fechaNacimiento) : '—'],
        ['DIRECCIÓN', alerta.victima.direccionDomicilio ?? '—', '', ''],
      ];
      this.pdfGenerator.agregarMetadatos(doc, metVictima);
    }

    // — Atención —
    if (alerta.atencion) {
      this.pdfGenerator.agregarSeccion(doc, 'Atención y Funcionarios Asignados');
      const metAtencion: MetadatoPar[] = [
        ['VEHÍCULO', alerta.atencion.siglaVehiculo, 'RADIO', alerta.atencion.siglaRadio],
        ['RESPONSABLE', alerta.atencion.usuarioWeb?.nombreCompleto ?? '—', 'GRADO', alerta.atencion.usuarioWeb?.grado ?? '—'],
      ];
      this.pdfGenerator.agregarMetadatos(doc, metAtencion);

      if (alerta.atencion.atencionFuncionario?.length) {
        const colsFuncionarios: TablaColumna[] = [
          { header: 'NRO', width: 40, align: 'center' },
          { header: 'NOMBRE COMPLETO', width: 180 },
          { header: 'GRADO', width: 90 },
          { header: 'ROL', width: 90 },
          { header: 'UNIDAD', width: 90 },
          { header: 'FECHA LLEGADA', width: 160 },
        ];
        const filasFuncionarios = alerta.atencion.atencionFuncionario.map((f: FuncionarioAsignadoDto, i) => [
          String(i + 1),
          f.nombreCompleto,
          f.grado,
          f.rolAtencion,
          f.unidad,
          f.fechaLlegada ? new Date(f.fechaLlegada).toLocaleString('es-BO', { timeZone: 'America/La_Paz' }) : 'NO',
        ]);

        this.pdfGenerator.agregarTabla(doc, colsFuncionarios, filasFuncionarios);
      }
    }

    // — Cierre —
    if (alerta.cierre) {
      this.pdfGenerator.agregarSeccion(doc, 'Información de Cierre');
      const metCierre: MetadatoPar[] = [
        ['MOTIVO CIERRE', alerta.cierre.motivoCierre, 'FECHA Y HORA', this.formatearFecha(alerta.cierre.fechaHora)],
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
      const filasEventos = alerta.eventos.map((e: EventoDto, i) => [String(i + 1), this.obtenerTituloEvento(e.tipoEvento), this.formatearFecha(e.fechaHora)]);
      this.pdfGenerator.agregarTabla(doc, colsEventos, filasEventos);
    }

    this.pdfGenerator.agregarPieDePagina(doc, 1, 1);
    return this.pdfGenerator.finalizar(doc);
  }

  private formatearFecha(fecha: Date | string | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleString('es-BO', { timeZone: 'America/La_Paz', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private formatearFechaSolo(fecha: Date | string | undefined): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-BO', { timeZone: 'America/La_Paz', day: '2-digit', month: '2-digit', year: 'numeric' });
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
