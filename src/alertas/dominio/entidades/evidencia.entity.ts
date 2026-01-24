import { TipoEvidencia } from '../enums/evento-enums';

export class EvidenciaEntity {
  constructor(
    public readonly id: string,
    public readonly idEvento: string,
    public readonly tipoEvidencia: TipoEvidencia,
    public readonly urlArchivo: string,
    public readonly creadoEn?: Date,
  ) {}
}
