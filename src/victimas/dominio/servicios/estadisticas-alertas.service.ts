import { Injectable } from '@nestjs/common';

import { AlertaVictima } from '../puertos/victima.port';

export interface EstadisticasAlertasVictima {
  totalAlertas: number;
  alertasActivas: number;
  alertasFinalizadas: number;
  alertasPorEstado: {
    [estado: string]: number;
  };
  tiempoPromedioAsignacion: string;
  tiempoPromedioCierre: string;
}

export interface AlertaConTiempos {
  idAlerta: string;
  fechaHora: Date;
  estadoAlerta: string;
  origen: string;
  idMunicipio: number | null;
  codigoCud: string | null;
  codigoRegistro: string | null;
  tiempoAsignacion: string | null;
  tiempoCierre: string | null;
  creadoEn: Date;
}

/**
 * Servicio de dominio para cálculo de estadísticas de alertas
 * Responsable de toda la lógica de negocio relacionada con métricas y tiempos
 */
@Injectable()
export class EstadisticasAlertasService {
  /**
   * Calcula los tiempos de asignación y cierre para cada alerta
   */
  calcularTiemposPorAlerta(alertas: AlertaVictima[]): AlertaConTiempos[] {
    return alertas.map((alerta) => {
      let tiempoAsignacion: string | null = null;
      let tiempoCierre: string | null = null;

      // Calcular tiempo de asignación (alerta.creado_en → atencion.creado_en)
      if (alerta.atencion) {
        const diffSegundos = (alerta.atencion.creadoEn.getTime() - alerta.creadoEn.getTime()) / 1000;
        tiempoAsignacion = this.formatearTiempo(diffSegundos);
      }

      // Calcular tiempo de cierre (alerta.creado_en → cierre.creado_en)
      if (alerta.cierre) {
        const diffSegundos = (alerta.cierre.creadoEn.getTime() - alerta.creadoEn.getTime()) / 1000;
        tiempoCierre = this.formatearTiempo(diffSegundos);
      }

      return {
        idAlerta: alerta.id,
        fechaHora: alerta.fechaHora,
        estadoAlerta: alerta.estadoAlerta,
        origen: alerta.origen,
        idMunicipio: alerta.idMunicipio,
        codigoCud: alerta.codigoCud,
        codigoRegistro: alerta.codigoRegistro,
        tiempoAsignacion,
        tiempoCierre,
        creadoEn: alerta.creadoEn,
      };
    });
  }

  /**
   * Calcula estadísticas generales de las alertas
   */
  calcularEstadisticas(alertas: AlertaVictima[], alertasConTiempos: AlertaConTiempos[]): EstadisticasAlertasVictima {
    const totalAlertas = alertas.length;
    const alertasActivas = alertas.filter((a) => ['PENDIENTE', 'ASIGNADA', 'EN_ATENCION'].includes(a.estadoAlerta)).length;
    const alertasFinalizadas = alertas.filter((a) => ['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'].includes(a.estadoAlerta)).length;

    // Contar alertas por estado
    const alertasPorEstado: { [estado: string]: number } = {};
    alertas.forEach((alerta) => {
      alertasPorEstado[alerta.estadoAlerta] = (alertasPorEstado[alerta.estadoAlerta] || 0) + 1;
    });

    // Calcular tiempos promedio
    const tiemposAsignacion = alertasConTiempos
      .map((a) => a.tiempoAsignacion)
      .filter((t) => t !== null)
      .map((t) => this.parsearTiempo(t));
    const tiempoPromedioAsignacion = tiemposAsignacion.length > 0 ? this.formatearTiempo(tiemposAsignacion.reduce((a, b) => a + b, 0) / tiemposAsignacion.length) : '00:00:00';

    const tiemposCierre = alertasConTiempos
      .map((a) => a.tiempoCierre)
      .filter((t) => t !== null)
      .map((t) => this.parsearTiempo(t));
    const tiempoPromedioCierre = tiemposCierre.length > 0 ? this.formatearTiempo(tiemposCierre.reduce((a, b) => a + b, 0) / tiemposCierre.length) : '00:00:00';

    return {
      totalAlertas,
      alertasActivas,
      alertasFinalizadas,
      alertasPorEstado,
      tiempoPromedioAsignacion,
      tiempoPromedioCierre,
    };
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

  /**
   * Convierte formato HH:MM:SS a segundos
   */
  private parsearTiempo(tiempo: string): number {
    const [horas, minutos, segundos] = tiempo.split(':').map(Number);
    return horas * 3600 + minutos * 60 + segundos;
  }
}
