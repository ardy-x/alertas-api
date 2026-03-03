import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';

import { AlertaVictima, HistorialAlertasVictima } from '../entidades/alerta-victima.entity';
import { ContactoEmergencia } from '../entidades/contacto-emergencia.entity';
import {
  ActualizarConexion,
  ActualizarDatosContacto,
  ActualizarDatosCuenta,
  ActualizarUbicacion,
  CrearVictimaDatos,
  FiltrosVictima,
  InformacionDispositivo,
  PermisoApp,
  VictimaBase,
  VictimaConDispositivo,
  VictimaDetalle,
} from '../entidades/victima.entity';
import { EstadoCuenta } from '../enums/victima-enums';

export {
  VictimaDetalle,
  VictimaBase,
  VictimaConDispositivo,
  CrearVictimaDatos,
  ActualizarConexion,
  ActualizarUbicacion,
  ActualizarDatosContacto,
  ActualizarDatosCuenta,
  InformacionDispositivo,
  PermisoApp,
  FiltrosVictima,
  ContactoEmergencia,
  AlertaVictima,
  HistorialAlertasVictima,
  PaginacionQuery,
};

export interface VictimaRepositorioPort {
  crearVictima(datos: CrearVictimaDatos): Promise<{ id: string }>;
  obtenerVictimaSimple(id: string): Promise<VictimaBase | null>;
  obtenerVictimaConDispositivo(id: string): Promise<VictimaConDispositivo | null>;
  obtenerDetalleVictima(id: string): Promise<VictimaDetalle | null>;
  obtenerPorCedula(cedulaIdentidad: string): Promise<VictimaConDispositivo | null>;
  obtenerPorCelular(celular: string): Promise<VictimaBase | null>;
  obtenerPorEmail(email: string): Promise<VictimaBase | null>;
  actualizarUbicacion(id: string, datos: ActualizarUbicacion): Promise<void>;
  actualizarDatosContacto(id: string, datos: ActualizarDatosContacto): Promise<void>;
  actualizarDatosCuenta(id: string, datos: ActualizarDatosCuenta): Promise<void>;
  actualizarConexion(id: string, datos: ActualizarConexion): Promise<void>;
  actualizarApiKey(id: string, apiKey: string): Promise<void>;
  actualizarEstadoCuenta(id: string, estado: EstadoCuenta): Promise<void>;
}
