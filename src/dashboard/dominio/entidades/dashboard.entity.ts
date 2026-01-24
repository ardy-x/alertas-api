// Datos procesados (con cálculos)
export interface MetricasGenerales {
  alertasActivas: number;
  alertasPendientes: number;
  alertasResueltas: number;
  tiempoPromedioAsignacion: string; // Formato HH:MM:SS
  tiempoPromedioAtencionTotal: string;
  tiempoPromedioRegistro: string;
}

// Datos crudos que devuelve el adaptador para métricas generales
export interface DatosMetricasGenerales {
  alertasActivas: number;
  alertasPendientes: number;
  alertasResueltas: number;
  tiemposAsignacion: Array<{ creadoEn: Date; alerta: { creadoEn: Date } }>;
  tiemposCierre: Array<{ creadoEn: Date; alerta: { creadoEn: Date } }>;
  alertasConTiempoRegistro: Array<{ fechaHora: Date; creadoEn: Date }>;
}

export interface AlertaPorMunicipio {
  idMunicipio: number;
  totalAlertas: number;
  alertasActivas: number;
}

export interface AlertaReciente {
  idAlerta: string;
  idMunicipio: number | null;
  nombreCompletoVictima: string;
  estadoAlerta: string;
  origen: string;
  fechaCreacion: Date;
  tiempoTranscurrido: string;
}

// Datos crudos de alertas recientes (sin procesamiento)
export interface AlertaRecienteBase {
  id: string;
  idMunicipio: number | null;
  estadoAlerta: string;
  origen: string;
  creadoEn: Date;
  victima: { nombreCompleto: string } | null;
}

export interface MetricasTiempo {
  tiempoPromedioAsignacion: string;
  tiempoPromedioAtencionTotal: string;
  tiempoPromedioRegistro: string;
  metricasPorOrigen: MetricasPorOrigen[];
}

// Datos crudos para métricas de tiempo
export interface DatosMetricasTiempo {
  tiemposAsignacion: Array<{ creadoEn: Date; alerta: { creadoEn: Date; origen: string } }>;
  tiemposCierre: Array<{ creadoEn: Date; alerta: { creadoEn: Date; origen: string } }>;
  alertasConTiempoRegistro: Array<{ fechaHora: Date; creadoEn: Date; origen: string }>;
}

export interface MetricasPorOrigen {
  origen: string;
  tiempoPromedioAsignacion: string;
  tiempoPromedioAtencionTotal: string;
  cantidadAlertas: number;
}
