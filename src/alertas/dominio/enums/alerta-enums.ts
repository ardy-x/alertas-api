export enum EstadoAlerta {
  PENDIENTE = 'PENDIENTE',
  ASIGNADA = 'ASIGNADA',
  EN_ATENCION = 'EN_ATENCION',
  RESUELTA = 'RESUELTA',
  CANCELADA = 'CANCELADA',
  FALSA_ALERTA = 'FALSA_ALERTA',
}

export enum OrigenAlerta {
  FELCV = 'FELCV',
  ATT = 'ATT',
}

export enum MotivoCierre {
  RESUELTA = 'RESUELTA',
  CANCELADA = 'CANCELADA',
  FALSA_ALERTA = 'FALSA_ALERTA',
}

export enum EstadoSolicitudCancelacion {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}
