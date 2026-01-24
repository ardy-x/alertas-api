import { TipoEvidencia } from '@prisma/client';

import { EvidenciaEntity } from '../entidades/evidencia.entity';

export interface CrearEvidenciaDatos {
  id: string;
  idEvento: string;
  tipoEvidencia: TipoEvidencia;
  rutaArchivo: string;
}

export interface EvidenciaRepositorioPort {
  crearEvidencia(datos: CrearEvidenciaDatos): Promise<void>;
  obtenerPorEvento(idEvento: string): Promise<EvidenciaEntity[]>;
}
