import { EstadoAlerta } from '../enums/alerta-enums';

/**
 * Servicio de dominio para gestión de estados de alertas
 * Contiene reglas de negocio sobre transiciones y eventos de estado
 */
export class AlertaEstadoDominioService {
  /**
   * Valida si una transición de estado es permitida
   */
  static validarCambioEstado(estadoActual: EstadoAlerta, nuevoEstado: EstadoAlerta): boolean {
    const transicionesValidas: Record<EstadoAlerta, EstadoAlerta[]> = {
      [EstadoAlerta.PENDIENTE]: [EstadoAlerta.ASIGNADA, EstadoAlerta.CANCELADA, EstadoAlerta.FALSA_ALERTA],
      [EstadoAlerta.ASIGNADA]: [EstadoAlerta.EN_ATENCION, EstadoAlerta.CANCELADA, EstadoAlerta.FALSA_ALERTA],
      [EstadoAlerta.EN_ATENCION]: [EstadoAlerta.RESUELTA, EstadoAlerta.CANCELADA, EstadoAlerta.FALSA_ALERTA],
      [EstadoAlerta.RESUELTA]: [],
      [EstadoAlerta.CANCELADA]: [],
      [EstadoAlerta.FALSA_ALERTA]: [],
    };

    return transicionesValidas[estadoActual]?.includes(nuevoEstado) || false;
  }
}
