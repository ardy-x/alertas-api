import { AlertaActiva, AlertaExtendida, AlertaHistorial, FiltrosAlerta, FiltrosAlertasActivas } from '../entidades/alerta.entity';

export interface AlertaWebRepositorioPort {
  obtenerDetalleAlerta(id: string): Promise<AlertaExtendida | null>;
  listarAlertasActivas(filtros?: FiltrosAlertasActivas): Promise<AlertaActiva[]>;
  listarAlertaHistorial(filtros: FiltrosAlerta): Promise<{ alertas: AlertaHistorial[]; total: number }>;
}
