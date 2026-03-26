import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';

export interface InfoDispositivo {
  navegador?: string;
  sistemaOperativo?: string;
  dispositivo?: string;
}

export interface UsuarioWebKerberosEntity {
  id: string; // ID de Kerberos
  grado: string;
  nombreCompleto: string;
  unidad: string;
  idDepartamento: number;
  rol: string;
  estadoSession: boolean;
  fcmToken?: string;
  infoDispositivo?: InfoDispositivo;
  actualizadoEn?: Date;
}

export interface CrearUsuarioWebKerberosDatos {
  id: string; // ID de Kerberos
  grado: string;
  nombreCompleto: string;
  unidad: string;
  idDepartamento: number;
  rol: string;
  estadoSession: boolean;
}

export interface RegistrarTokenFCMDatos {
  fcmToken: string;
  infoDispositivo?: InfoDispositivo;
}

export interface FiltrosUsuarioWeb extends PaginacionQuery {
  estadoSession?: boolean;
  busqueda?: string;
}

export interface UsuarioWebSimple {
  id: string;
  grado: string;
  nombreCompleto: string;
  unidad: string;
  estadoSession: boolean;
  actualizadoEn?: Date;
}
