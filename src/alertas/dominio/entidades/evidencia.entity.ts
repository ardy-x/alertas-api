import { TipoEvidencia } from '../enums/evento-enums';

export class EvidenciaEntity {
  constructor(
    public readonly id: string,
    public readonly idAlerta: string,
    public readonly tipoEvidencia: TipoEvidencia,
    public readonly rutaArchivo: string,
    public readonly creadoEn?: Date,
  ) {}
}
