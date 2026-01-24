import { MotivoCierre } from '../enums/alerta-enums';

export interface CierreAlertaEntity {
  id: string;
  idAlerta: string;
  idUsuarioWeb: string;
  fechaHora: Date;
  estadoVictima: string;
  motivoCierre: MotivoCierre;
  observaciones: string | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  agresores: CierreAlertaAgresorEntity[];
}

export interface CierreAlertaAgresorEntity {
  id: string;
  idCierreAlerta: string;
  cedulaIdentidad: string;
  nombreCompleto: string;
  parentesco: string | null;
  creadoEn: Date;
}

export interface CrearCierreAlertaDatos {
  id: string;
  idAlerta: string;
  idUsuarioWeb: string;
  fechaHora: Date;
  estadoVictima: string;
  agresores: CrearCierreAlertaAgresorDatos[];
  motivoCierre: MotivoCierre;
  observaciones: string | null;
}

export interface CrearCierreAlertaAgresorDatos {
  cedulaIdentidad: string;
  nombreCompleto: string;
  parentesco: string | null;
}
