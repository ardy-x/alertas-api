import { BadRequestException, ConflictException } from '@nestjs/common';

import { AlertaBase } from '../entidades/alerta.entity';
import { EstadoAlerta, EstadoSolicitudCancelacion, MotivoCierre } from '../enums/alerta-enums';

export class AlertaValidacionDominioService {
  static validarProcesamientoPermitido(fechaHora: Date): void {
    const errores: string[] = [];
    const horasDesdeCreacion = (Date.now() - fechaHora.getTime()) / (1000 * 60 * 60);
    const LIMITE_HORAS_ANTIGUAS = 24;

    if (horasDesdeCreacion > LIMITE_HORAS_ANTIGUAS) {
      errores.push(`No se pueden procesar alertas de más de ${LIMITE_HORAS_ANTIGUAS} horas de antigüedad`);
    }

    if (errores.length > 0) {
      throw new BadRequestException(`No se puede procesar la alerta: ${errores.join(', ')}`);
    }
  }

  static validarAlertaNoCerrada(alerta: AlertaBase): void {
    if (alerta.estadoAlerta === EstadoAlerta.RESUELTA || alerta.estadoAlerta === EstadoAlerta.CANCELADA || alerta.estadoAlerta === EstadoAlerta.FALSA_ALERTA) {
      throw new ConflictException('La alerta ya está cerrada');
    }
  }

  static validarObservacionesFalsaAlarma(motivoCierre: MotivoCierre | string, observaciones?: string | null): void {
    if (String(motivoCierre) === String(MotivoCierre.FALSA_ALERTA)) {
      if (!observaciones || observaciones.trim().length === 0) {
        throw new BadRequestException('Para falsa alarma, las observaciones son obligatorias');
      }
    }
  }

  static determinarEstadoPorMotivoCierre(motivoCierre: MotivoCierre | string): EstadoAlerta {
    const motivoCierreStr = String(motivoCierre);
    if (motivoCierreStr === String(MotivoCierre.RESUELTA)) {
      return EstadoAlerta.RESUELTA;
    } else if (motivoCierreStr === String(MotivoCierre.FALSA_ALERTA)) {
      return EstadoAlerta.FALSA_ALERTA;
    }
    return EstadoAlerta.RESUELTA;
  }

  static validarSolicitudPendiente(estadoSolicitud: EstadoSolicitudCancelacion): void {
    if (estadoSolicitud !== EstadoSolicitudCancelacion.PENDIENTE) {
      throw new BadRequestException('Solo se pueden procesar solicitudes pendientes');
    }
  }

  static validarAlertaTieneVictima(alerta: AlertaBase): void {
    if (!alerta.idVictima) {
      throw new BadRequestException('La alerta no tiene una víctima asociada');
    }
  }

  static validarAlertaTieneMunicipio(alerta: AlertaBase): void {
    if (!alerta.idMunicipio) {
      throw new BadRequestException('La alerta no tiene un municipio asociado');
    }
  }
}
