export class InvestigadorVictimaEntity {
  constructor(
    public readonly id: string,
    public readonly idVictima: string,
    public readonly ciInvestigador: string,
    public readonly idUsuarioAsignador: string,
    public readonly fechaAsignacion: Date,
    public readonly activo: boolean,
    public readonly observaciones: string | null,
    public readonly creadoEn: Date,
    public readonly actualizadoEn: Date | null,
  ) {}
}
