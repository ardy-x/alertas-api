export class InvestigadorActivoDto {
  declare id: string;
  declare idVictima: string;
  declare ciInvestigador: string;
  declare fechaAsignacion: Date;
  declare observaciones: string | null;
  declare nombreCompleto: string;
  declare grado: string;
  declare unidad: string;
  declare cargo: string;
  declare nroEscalafon: string;
}

export class InvestigadorHistorialDto {
  declare id: string;
  declare ciInvestigador: string;
  declare fechaAsignacion: Date;
  declare activo: boolean;
  declare observaciones: string | null;
  declare nombreCompleto: string;
  declare grado: string;
  declare unidad: string;
  declare cargo: string;
  declare nroEscalafon: string;
}

export class ListarHistorialInvestigadoresResponseDto {
  declare investigadores: InvestigadorHistorialDto[];
}
