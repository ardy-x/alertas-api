import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import {
  AlertaPorMunicipio,
  AlertaReciente,
  AlertaRecienteBase,
  DatosMetricasGenerales,
  DatosMetricasTiempo,
  MetricasGenerales,
  MetricasPorOrigen,
  MetricasTiempo,
} from '../entidades/dashboard.entity';

export { MetricasGenerales, DatosMetricasGenerales, AlertaPorMunicipio, AlertaReciente, AlertaRecienteBase, MetricasTiempo, DatosMetricasTiempo, MetricasPorOrigen };

export interface EstadoAlertaCount {
  estado: string;
  cantidad: number;
}

export interface AlertaConFechaHora {
  fechaHora: Date;
  idMunicipio: number | null;
}

export interface AlertaParaMapa {
  id: string;
  estado: string;
  idMunicipio: number | null;
  fechaHora: Date;
  origen: string;
  ubicacion: UbicacionPoint | null;
}

export interface DashboardRepositorioPort {
  obtenerMetricasGenerales(): Promise<DatosMetricasGenerales>;
  obtenerAlertasPorMunicipio(): Promise<AlertaPorMunicipio[]>;
  obtenerAlertasRecientes(limite: number): Promise<AlertaRecienteBase[]>;
  obtenerMetricasTiempo(): Promise<DatosMetricasTiempo>;
  obtenerDistribucionEstados(): Promise<EstadoAlertaCount[]>;
  obtenerAlertasConFechaHora(): Promise<AlertaConFechaHora[]>;
  obtenerTodasLasAlertas(): Promise<AlertaParaMapa[]>;
}
