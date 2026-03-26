import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { AlertaPorMunicipio, DatosMetricasGenerales, MetricasGenerales, MetricasPorOrigen } from '../entidades/dashboard.entity';

export { MetricasGenerales, DatosMetricasGenerales, AlertaPorMunicipio, MetricasPorOrigen };

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
  obtenerDistribucionEstados(): Promise<EstadoAlertaCount[]>;
  obtenerAlertasConFechaHora(): Promise<AlertaConFechaHora[]>;
  obtenerTodasLasAlertas(): Promise<AlertaParaMapa[]>;
}
