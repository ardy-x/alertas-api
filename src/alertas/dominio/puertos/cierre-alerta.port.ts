import { CrearCierreAlertaDatos } from '../entidades/cierre-alerta.entity';
export interface CierreAlertaRepositorioPort {
  cerrarAlerta(datos: CrearCierreAlertaDatos): Promise<void>;
}
