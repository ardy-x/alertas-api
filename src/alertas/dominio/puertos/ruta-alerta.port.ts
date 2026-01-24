import { ActualizarRutaAlertaDatos, CrearRutaAlertaDatos, RutaAlertaEntity } from '../entidades/ruta-alerta.entity';

export interface RutaAlertaRepositorioPort {
  crearRutaAlerta(datos: CrearRutaAlertaDatos): Promise<RutaAlertaEntity>;
  obtenerPorIdAlerta(idAlerta: string): Promise<RutaAlertaEntity | null>;
  actualizarPunto(idAlerta: string, datos: ActualizarRutaAlertaDatos): Promise<void>;
}
