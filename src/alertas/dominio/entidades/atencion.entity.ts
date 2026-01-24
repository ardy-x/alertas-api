import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

export interface AtencionEntity {
  id: string;
  idAlerta: string;
  idUsuarioWeb: string;
  siglaVehiculo: string | null;
  siglaRadio: string | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export interface CrearAtencionCompleta {
  idAtencion: string;
  idAlerta: string;
  idUsuarioWeb: string;
  siglaVehiculo?: string;
  siglaRadio?: string;
  funcionarios: Array<{
    id: string;
    rolAtencion: string;
    ubicacion: UbicacionPoint | null;
    turnoInicio: string;
    turnoFin: string;
    ciFuncionario: string;
    unidad: string;
  }>;
}

export interface ActualizarAtencion {
  idUsuarioWeb?: string;
  siglaVehiculo?: string;
  siglaRadio?: string;
}
