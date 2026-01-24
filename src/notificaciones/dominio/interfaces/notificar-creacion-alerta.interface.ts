import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';

export interface NotificarAlertaCreadaDatos {
  idAlerta: string;
  estado: EstadoAlerta;
  origen: OrigenAlerta;
  fechaHora: string;
  victima: string;
  idDepartamento: number;
}
