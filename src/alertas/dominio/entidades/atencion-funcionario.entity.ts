import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

import { RolAtencion } from '../enums/atencion-enums';

export interface Funcionario {
  grado: string;
  nombreCompleto: string;
  unidad: string;
}

export interface AtencionFuncionarioEntity {
  id: string;
  idAtencion: string;
  rolAtencion: RolAtencion;
  ubicacion: UbicacionPoint | null;
  turnoInicio: string;
  turnoFin: string;
  ciFuncionario: string | null;
  unidad: string | null;
  fechaLlegada?: string | null;
  confirmacionVictima?: boolean;
  // campos adicionales para mostrar información externa
  grado?: string | null;
  nombreCompleto?: string | null;
}

export interface CrearAtencionFuncionarioDatos {
  id: string;
  idAtencion: string;
  rolAtencion: RolAtencion;
  ubicacion: UbicacionPoint | null;
  turnoInicio: string;
  turnoFin: string;
  funcionario?: Funcionario | null;
}

export interface AgregarFuncionarioDatos {
  id: string;
  idAtencion: string;
  rolAtencion: RolAtencion;
  ubicacion: UbicacionPoint | null;
  turnoInicio: string;
  turnoFin: string;
  ciFuncionario: string;
  unidad: string | null;
}
