import { VictimaDetalle } from './victima.entity';

export interface AlertaVictima {
  id: string;
  fechaHora: Date;
  estadoAlerta: string;
  origen: string;
  idMunicipio: number | null;
  codigoCud: string | null;
  codigoRegistro: string | null;
  creadoEn: Date;
  atencion?: {
    creadoEn: Date;
  } | null;
  cierre?: {
    creadoEn: Date;
  } | null;
}
export interface HistorialAlertasVictima {
  victima: VictimaDetalle;
  alertas: AlertaVictima[];
}
