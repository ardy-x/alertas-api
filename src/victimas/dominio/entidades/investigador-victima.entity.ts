export class InvestigadorVictimaEntity {
  constructor(
    public readonly id: string,
    public readonly idVictima: string,
    public readonly idUsuarioInvestigador: string,
    public readonly idUsuarioAsignador: string,
    public readonly fechaAsignacion: Date,
    public readonly activo: boolean,
    public readonly observaciones: string | null,
    public readonly nombreCompleto: string,
    public readonly grado: string,
    public readonly unidad: string,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date | null,
  ) {}
}
