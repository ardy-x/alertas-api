import { ActualizarAtencion, AtencionEntity, CrearAtencionCompleta } from '../entidades/atencion.entity';

export { CrearAtencionCompleta, ActualizarAtencion };

export interface AtencionRepositorioPort {
  crearAtencionCompleta(datos: CrearAtencionCompleta): Promise<void>;
  obtenerAtencionSimple(id: string): Promise<AtencionEntity | null>;
  existePorAlerta(idAlerta: string): Promise<boolean>;
}
