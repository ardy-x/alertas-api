import { Injectable } from '@nestjs/common';

import { MetadatoPar, PdfGeneratorService, TablaColumna } from '@/reportes/infraestructura/generadores/pdf-generator.service';
import { ObtenerInvestigadorActivoUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/obtener-investigador-activo.use-case';
import { ObtenerHistorialAlertasVictimaUseCase } from '@/victimas/aplicacion/casos-uso/obtener-historial-alertas-victima.use-case';
import { ObtenerHistorialAlertasParamsDto } from '@/victimas/presentacion/dto/entrada/victima.dto';
import { AlertaVictimaDto } from '@/victimas/presentacion/dto/salida/historial-alertas-victima.dto';

@Injectable()
export class ReporteHistorialVictimaUseCase {
  constructor(
    private readonly obtenerHistorialAlertasVictimaUseCase: ObtenerHistorialAlertasVictimaUseCase,
    private readonly obtenerInvestigadorActivoUseCase: ObtenerInvestigadorActivoUseCase,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  async ejecutar(params: ObtenerHistorialAlertasParamsDto): Promise<Buffer> {
    const datos = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar(params);

    // Obtener investigador activo
    let investigadorTexto = 'Sin asignar';
    try {
      const investigador = await this.obtenerInvestigadorActivoUseCase.ejecutar(datos.victima.id);
      if (investigador) {
        investigadorTexto = `${investigador.grado} ${investigador.nombreCompleto}`;
      }
    } catch {
      investigadorTexto = 'Sin asignar';
    }

    const doc = this.pdfGenerator.crearDocumento();

    const fechaNacimiento = datos.victima.fechaNacimiento ? this.formatearFechaSolo(datos.victima.fechaNacimiento) : '—';
    const edad = datos.victima.fechaNacimiento ? this.calcularEdad(datos.victima.fechaNacimiento) : '—';
    const estadoCuentaDescripcion = this.obtenerDescripcionEstadoCuenta(datos.victima.estadoCuenta);

    this.pdfGenerator.agregarEncabezado(doc, 'Historial de Alertas por Víctima', 'Sistema de Alertas Adela Zamudio');

    const metadatos: MetadatoPar[] = [
      ['VÍCTIMA', datos.victima.nombreCompleto, 'TOTAL ALERTAS', String(datos.estadisticas.totalAlertas)],
      ['C.I.', datos.victima.cedulaIdentidad, 'ALERTAS ACTIVAS', String(datos.estadisticas.alertasActivas)],
      ['CELULAR', datos.victima.celular ?? '—', 'ALERTAS FINALIZADAS', String(datos.estadisticas.alertasFinalizadas)],
      ['CORREO', datos.victima.correo ?? '—', 'T. PROM. ASIGNACIÓN', datos.estadisticas.tiempoPromedioAsignacion ?? '—'],
      ['FECHA NACIMIENTO', `${fechaNacimiento} (${edad} años)`, 'T. PROM. CIERRE', datos.estadisticas.tiempoPromedioCierre ?? '—'],
      ['INVESTIGADOR ASIGNADO', investigadorTexto, 'ESTADO CUENTA', datos.victima.estadoCuenta],
    ];
    this.pdfGenerator.agregarMetadatos(doc, metadatos);

    // Agregar descripción del estado de cuenta
    this.pdfGenerator.agregarTextoDescriptivo(doc, estadoCuentaDescripcion);

    const columnas: TablaColumna[] = [
      { header: 'NRO', width: 40, align: 'center' },
      { header: 'FECHA', width: 80, align: 'center' },
      { header: 'HORA', width: 60, align: 'center' },
      { header: 'ESTADO', width: 95, align: 'center' },
      { header: 'ORIGEN', width: 70, align: 'center' },
      { header: 'MUNICIPIO', width: 120 },
      { header: 'PROVINCIA', width: 120 },
      { header: 'DEPARTAMENTO', width: 110 },
      { header: 'T. ASIG.', width: 80, align: 'center' },
      { header: 'T. CIERRE', width: 80, align: 'center' },
    ];

    const filas = datos.alertas.map((alerta: AlertaVictimaDto, idx) => {
      const [fecha, hora] = this.separarFechaHora(alerta.fechaHora);
      return [
        String(idx + 1),
        fecha,
        hora,
        alerta.estadoAlerta ?? '—',
        alerta.origen ?? '—',
        alerta.municipio ?? '—',
        alerta.provincia ?? '—',
        alerta.departamento ?? '—',
        alerta.tiempoAsignacion ?? '—',
        alerta.tiempoCierre ?? '—',
      ];
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
    return String(edad);
  }

  private obtenerDescripcionEstadoCuenta(estado: string): string {
    const descripciones: Record<string, string> = {
      ACTIVA: 'La víctima cuenta con la aplicación del Botón de Pánico instalada y operativa para el envío de alertas de auxilio inmediato hacia la FELCV en caso de emergencia.',

      INACTIVA: 'La víctima no tiene la aplicación activa o la sesión fue cerrada en el dispositivo móvil, por lo que el Botón de Pánico no se encuentra funcionando actualmente.',

      SUSPENDIDA: 'La cuenta ha sido bloqueada y la aplicación se encuentra deshabilitada, por lo tanto, el Botón de Pánico no enviará ninguna alerta de auxilio a la policía.',

      PENDIENTE_VERIFICACION: 'La cuenta está en etapa de revisión de datos personales y las funciones del Botón de Pánico se habilitarán una vez concluida la validación oficial de la identidad.',
    };
    return descripciones[estado] || 'Estado de cuenta no especificado.';
  }
}
