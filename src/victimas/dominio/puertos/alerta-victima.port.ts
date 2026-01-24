import { HistorialAlertasVictima } from '../entidades/alerta-victima.entity';
import { FiltrosVictima, VictimaBase } from './victima.port';

export interface AlertaVictimaRepositorioPort {
  obtenerHistorialAlertas(idVictima: string): Promise<HistorialAlertasVictima | null>;
  listarVictimas(filtros: FiltrosVictima): Promise<{ victimas: VictimaBase[]; total: number }>;
  suspenderCuenta(id: string): Promise<void>;
}
