import { Injectable } from '@nestjs/common';

import { AlertaReciente, MetricasGenerales, MetricasPorOrigen, MetricasTiempo } from '../entidades/dashboard.entity';

export interface DatosMetricasGenerales {
  alertasActivas: number;
  alertasPendientes: number;
  alertasResueltas: number;
  tiemposAsignacion: Array<{ creadoEn: Date; alerta: { creadoEn: Date } }>;
  tiemposCierre: Array<{ creadoEn: Date; alerta: { creadoEn: Date } }>;
  alertasConTiempoRegistro: Array<{ fechaHora: Date; creadoEn: Date }>;
}

export interface DatosMetricasTiempo {
  tiemposAsignacion: Array<{ creadoEn: Date; alerta: { creadoEn: Date; origen: string } }>;
  tiemposCierre: Array<{ creadoEn: Date; alerta: { creadoEn: Date; origen: string } }>;
  alertasConTiempoRegistro: Array<{ fechaHora: Date; creadoEn: Date; origen: string }>;
}

export interface AlertaRecienteBase {
  id: string;
  idMunicipio: number | null;
  estadoAlerta: string;
  origen: string;
  creadoEn: Date;
  victima: { nombreCompleto: string } | null;
}

/**
 * Servicio de dominio para cálculo de métricas del dashboard
 * Responsable de toda la lógica de negocio relacionada con estadísticas y tiempos
 */
@Injectable()
export class MetricasDashboardService {
  /**
   * Calcula métricas generales del dashboard
   */
  calcularMetricasGenerales(datos: DatosMetricasGenerales): MetricasGenerales {
    // Calcular tiempo promedio de asignación (alerta.creado_en → atencion.creado_en)
    const promedioAsignacion = datos.tiemposAsignacion.length
      ? datos.tiemposAsignacion.reduce((acc, t) => {
          const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
          return acc + diff;
        }, 0) / datos.tiemposAsignacion.length
      : 0;

    // Calcular tiempo promedio total (alerta.creado_en → cierre.creado_en)
    const promedioAtencionTotal = datos.tiemposCierre.length
      ? datos.tiemposCierre.reduce((acc, t) => {
          const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
          return acc + diff;
        }, 0) / datos.tiemposCierre.length
      : 0;

    // Calcular tiempo promedio de registro (alerta.fecha_hora → alerta.creado_en)
    const promedioRegistro = datos.alertasConTiempoRegistro.length
      ? datos.alertasConTiempoRegistro.reduce((acc, a) => {
          const diff = (a.creadoEn.getTime() - a.fechaHora.getTime()) / 1000;
          return acc + Math.abs(diff);
        }, 0) / datos.alertasConTiempoRegistro.length
      : 0;

    return {
      alertasActivas: datos.alertasActivas,
      alertasPendientes: datos.alertasPendientes,
      alertasResueltas: datos.alertasResueltas,
      tiempoPromedioAsignacion: this.formatearTiempo(promedioAsignacion),
      tiempoPromedioAtencionTotal: this.formatearTiempo(promedioAtencionTotal),
      tiempoPromedioRegistro: this.formatearTiempo(promedioRegistro),
    };
  }

  /**
   * Calcula métricas de tiempo detalladas con desgloses por origen
   */
  calcularMetricasTiempo(datos: DatosMetricasTiempo): MetricasTiempo {
    // Tiempo promedio de asignación general
    const promedioAsignacion = datos.tiemposAsignacion.length
      ? datos.tiemposAsignacion.reduce((acc, t) => {
          const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
          return acc + diff;
        }, 0) / datos.tiemposAsignacion.length
      : 0;

    // Tiempo promedio de atención total general
    const promedioAtencionTotal = datos.tiemposCierre.length
      ? datos.tiemposCierre.reduce((acc, t) => {
          const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
          return acc + diff;
        }, 0) / datos.tiemposCierre.length
      : 0;

    // Tiempo promedio de registro general
    const promedioRegistro = datos.alertasConTiempoRegistro.length
      ? datos.alertasConTiempoRegistro.reduce((acc, a) => {
          const diff = (a.creadoEn.getTime() - a.fechaHora.getTime()) / 1000;
          return acc + Math.abs(diff);
        }, 0) / datos.alertasConTiempoRegistro.length
      : 0;

    // Métricas por origen
    const metricasPorOrigen: MetricasPorOrigen[] = [];
    const origenes = ['ATT', 'FELCV'];

    for (const origen of origenes) {
      const tiemposOrigen = datos.tiemposAsignacion.filter((t) => t.alerta.origen === origen);
      const tiemposCierreOrigen = datos.tiemposCierre.filter((t) => t.alerta.origen === origen);

      const promedioAsignacionOrigen = tiemposOrigen.length
        ? tiemposOrigen.reduce((acc, t) => {
            const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
            return acc + diff;
          }, 0) / tiemposOrigen.length
        : 0;

      const promedioAtencionOrigen = tiemposCierreOrigen.length
        ? tiemposCierreOrigen.reduce((acc, t) => {
            const diff = (t.creadoEn.getTime() - t.alerta.creadoEn.getTime()) / 1000;
            return acc + diff;
          }, 0) / tiemposCierreOrigen.length
        : 0;

      metricasPorOrigen.push({
        origen,
        tiempoPromedioAsignacion: this.formatearTiempo(promedioAsignacionOrigen),
        tiempoPromedioAtencionTotal: this.formatearTiempo(promedioAtencionOrigen),
        cantidadAlertas: tiemposOrigen.length,
      });
    }

    return {
      tiempoPromedioAsignacion: this.formatearTiempo(promedioAsignacion),
      tiempoPromedioAtencionTotal: this.formatearTiempo(promedioAtencionTotal),
      tiempoPromedioRegistro: this.formatearTiempo(promedioRegistro),
      metricasPorOrigen,
    };
  }

  /**
   * Procesa alertas recientes crudas y calcula tiempo transcurrido
   */
  procesarAlertasRecientes(alertasCrudas: AlertaRecienteBase[]): AlertaReciente[] {
    return alertasCrudas.map((alerta) => {
      const tiempoTranscurrido = Math.floor((Date.now() - alerta.creadoEn.getTime()) / 1000);

      return {
        idAlerta: alerta.id,
        idMunicipio: alerta.idMunicipio,
        nombreCompletoVictima: alerta.victima ? alerta.victima.nombreCompleto : 'Sin víctima',
        estadoAlerta: alerta.estadoAlerta,
        origen: alerta.origen,
        fechaCreacion: alerta.creadoEn,
        tiempoTranscurrido: this.formatearTiempo(tiempoTranscurrido),
      };
    });
  }

  /**
   * Convierte segundos a formato HH:MM:SS
   */
  private formatearTiempo(segundos: number): string {
    if (!segundos || Number.isNaN(segundos)) return '00:00:00';

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segs).padStart(2, '0')}`;
  }
}
