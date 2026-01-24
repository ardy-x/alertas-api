import { DatosExternosAttEntity } from '../entidades/datos-externos-att.entity';
import { DatosExternosAtt } from '../entidades/persona-datos-att.entity';

export interface DatosExternosAttRepositorioPort {
  crearAlertaATT(datos: DatosExternosAtt, id: string): Promise<DatosExternosAttEntity>;
  obtenerAlertaATT(id: string): Promise<DatosExternosAttEntity | null>;
}
