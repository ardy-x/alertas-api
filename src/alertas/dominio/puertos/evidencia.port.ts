import { TipoEvidencia } from '@prisma/client';

import { EvidenciaEntity } from '../entidades/evidencia.entity';

export interface CrearEvidenciaDatos {
  id: string;
  idAlerta: string;
  tipoEvidencia: TipoEvidencia;
  rutaArchivo: string;
}

export interface EvidenciaRepositorioPort {
  crearEvidencia(datos: CrearEvidenciaDatos): Promise<void>;
  obtenerPorAlerta(idAlerta: string): Promise<EvidenciaEntity[]>;
  eliminarEvidencia(id: string): Promise<void>;
}
