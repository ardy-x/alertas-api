import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { TipoEvento } from '../enums/evento-enums';

export interface CrearEventoDatos {
  id: string;
  idAlerta: string;
  idUsuarioWeb?: string | null;
  tipoEvento: TipoEvento;
  fechaHora: Date;
  ubicacion?: UbicacionPoint | null;
  ciFuncionario?: string | null;
}

export interface EventoRepositorioPort {
  crearEvento(datos: CrearEventoDatos): Promise<void>;
}
