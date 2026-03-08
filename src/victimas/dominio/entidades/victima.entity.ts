import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';
import { EstadoCuenta } from '../enums/victima-enums';
import { ContactoEmergencia } from './contacto-emergencia.entity';

export interface InformacionDispositivo {
  marca?: string;
  modelo?: string;
  versionSO?: string;
  versionApp?: string;
}

export interface VictimaBase {
  id: string;
  cedulaIdentidad: string;
  nombreCompleto: string;
  celular: string;
  idMunicipio: number;
  fechaNacimiento: Date;
  correo?: string;
  estadoCuenta: EstadoCuenta;
  creadoEn?: Date;
  ultimaConexion?: Date;
  permisosApp?: PermisoApp;
}

export interface VictimaConDispositivo extends VictimaBase {
  apiKey?: string;
  idDispositivo?: string;
  fcmToken?: string;
}

export interface CrearVictimaDatos extends VictimaBase {
  direccionDomicilio: string;
  puntoReferencia: string;
}

export interface ActualizarUbicacion {
  direccionDomicilio?: string;
  puntoReferencia?: string;
  idMunicipio?: number;
}

export interface VictimaDetalle extends VictimaBase {
  direccionDomicilio: string;
  puntoReferencia: string;
  contactosEmergencia: ContactoEmergencia[];
}

export interface ActualizarDatosContacto {
  celular?: string;
  correo?: string;
}

export interface ActualizarDatosCuenta {
  idDispositivo?: string;
  fcmToken?: string;
  infoDispositivo?: InformacionDispositivo;
}

export interface PermisoApp {
  ubicacion: boolean;
  notificaciones: boolean;
}

export interface ActualizarConexion {
  ultimaConexion: Date;
  permisosApp: PermisoApp;
}

export interface FiltrosVictima extends PaginacionQuery {
  estadoCuenta?: EstadoCuenta[];
  municipiosIds?: number[];
  victimasIds?: string[];
  busqueda?: string;
}
