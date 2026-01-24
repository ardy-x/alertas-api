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

export interface DashboardRepositorioPort {
  obtenerMetricasGenerales(): Promise<DatosMetricasGenerales>;
  obtenerAlertasPorMunicipio(): Promise<AlertaPorMunicipio[]>;
  obtenerAlertasRecientes(limite: number): Promise<AlertaRecienteBase[]>;
  obtenerMetricasTiempo(): Promise<DatosMetricasTiempo>;
}
