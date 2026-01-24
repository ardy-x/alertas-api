import { EstadoAlerta } from '@/alertas/dominio/enums/alerta-enums';

export interface NotificarCambioEstadoAlertaRequest {
  idAlerta: string;
  idVictima: string;
  estadoFinal: string | EstadoAlerta;
}
