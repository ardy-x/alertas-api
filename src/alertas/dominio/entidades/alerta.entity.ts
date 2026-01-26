import { PaginacionQuery } from '@/core/interfaces/paginacion-query.interface';
import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { VictimaBase, VictimaDetalle } from '@/victimas/dominio/entidades/victima.entity';
import { EstadoAlerta, OrigenAlerta } from '../enums/alerta-enums';
import { CierreAlertaEntity } from './cierre-alerta.entity';
import { RutaAlertaEntity } from './ruta-alerta.entity';

export interface AlertaEntity {
  id: string;
  idVictima: string | null;
  idMunicipio: number | null;
  fechaHora: Date;
  codigoCud: string | null;
  codigoRegistro: string | null;
  estadoAlerta: EstadoAlerta;
  ubicacion: UbicacionPoint | null;
  origen: OrigenAlerta;
  creadoEn?: Date;
  actualizadoEn?: Date;
}

export interface FuncionarioAtencion {
  id: string;
  idUsuarioWeb: string | null;
  ciFuncionario: string | null;
  grado: string | null;
  nombreCompleto: string | null;
  organismo: string | null;
  unidad: string | null;
  rolAtencion: string;
  turnoInicio: string;
  turnoFin: string;
  ubicacion: UbicacionPoint | null;
}

export interface AtencionAlerta {
  id: string;
  siglaVehiculo: string;
  siglaRadio: string;
  funcionarios: FuncionarioAtencion[];
  atencionFuncionario?: FuncionarioAtencion[];
  idUsuarioWeb?: string | null;
  gradoUsuarioWeb?: string | null;
  nombreCompletoUsuarioWeb?: string | null;
}

export interface EventoAlerta {
  id: string;
  tipoEvento: string;
  fechaHora: Date;
  ubicacion: UbicacionPoint | null;
}

export interface AlertaExtendida {
  id: string;
  idVictima: string | null;
  idMunicipio: number | null;
  fechaHora: Date;
  codigoCud: string | null;
  codigoRegistro: string | null;
  estadoAlerta: EstadoAlerta;
  ubicacion: UbicacionPoint | null;
  origen: OrigenAlerta;
  datosExternos?: unknown;
  victima?: Partial<VictimaDetalle>;
  atencion?: AtencionAlerta;
  eventos?: EventoAlerta[];
  cierre?: CierreAlertaEntity;
  ultimoPunto?: {
    latitud: number;
    longitud: number;
  };
  municipio?: string;
  provincia?: string;
  departamento?: string;
  rutaAlerta?: RutaAlertaEntity;
}

export interface NuevaAlerta {
  id: string;
  idVictima: string;
  idMunicipio: number | null;
  fechaHora: Date;
  codigoCud: string | null;
  codigoRegistro: string | null;
  estadoAlerta: EstadoAlerta;
  ubicacion: UbicacionPoint | null;
  origen: OrigenAlerta;
}

export interface FiltrosAlertasActivas {
  municipiosIds?: number[];
}

export interface FiltrosAlerta extends PaginacionQuery {
  estadoAlerta?: EstadoAlerta[];
  origen?: OrigenAlerta[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  idMunicipio?: number;
  municipiosIds?: number[];
  busqueda?: string;
}

export interface AlertaBase {
  id: string;
  idVictima: string | null;
  estadoAlerta: EstadoAlerta;
  fechaHora: Date;
  ubicacion: UbicacionPoint | null;
  origen: OrigenAlerta;
  idMunicipio?: number | null;
}

export interface AlertaConMunicipio extends AlertaBase {
  municipio?: string;
  provincia?: string;
  departamento?: string;
}

export interface AlertaActiva extends AlertaConMunicipio {
  victima?: Partial<VictimaBase>;
}

export interface AlertaHistorial {
  id: string;
  idVictima: string | null;
  estadoAlerta: EstadoAlerta;
  fechaHora: Date;
  origen: OrigenAlerta;
  idMunicipio?: number | null;
  municipio?: string;
  provincia?: string;
  departamento?: string;
  codigoCud?: string | null;
  codigoRegistro?: string | null;
  creadoEn?: Date;
  actualizadoEn?: Date;
  datosExternos?: unknown;
  victima?: Partial<VictimaBase>;
}

export interface AlertaCreada {
  id: string;
  estadoAlerta: EstadoAlerta;
}

export interface DatosVictimaParaAlerta {
  nombreCompleto: string;
  idMunicipio: number | null;
}
