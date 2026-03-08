import { ApiProperty } from '@nestjs/swagger';

export class InvestigadorActivoDto {
  @ApiProperty()
  declare id: string;
  @ApiProperty()
  declare idVictima: string;
  @ApiProperty()
  declare ciInvestigador: string;
  @ApiProperty()
  declare fechaAsignacion: Date;
  @ApiProperty()
  declare observaciones: string | null;
  @ApiProperty()
  declare nombreCompleto: string;
  @ApiProperty()
  declare grado: string;
  @ApiProperty()
  declare unidad: string;
  @ApiProperty()
  declare cargo: string;
  @ApiProperty()
  declare nroEscalafon: string;
}

export class InvestigadorHistorialDto {
  @ApiProperty()
  declare id: string;
  @ApiProperty()
  declare ciInvestigador: string;
  @ApiProperty()
  declare fechaAsignacion: Date;
  @ApiProperty()
  declare activo: boolean;
  @ApiProperty()
  declare observaciones: string | null;
  @ApiProperty()
  declare nombreCompleto: string;
  @ApiProperty()
  declare grado: string;
  @ApiProperty()
  declare unidad: string;
  @ApiProperty()
  declare cargo: string;
  @ApiProperty()
  declare nroEscalafon: string;
}

export class ListarHistorialInvestigadoresResponseDto {
  @ApiProperty({ type: [InvestigadorHistorialDto] })
  declare investigadores: InvestigadorHistorialDto[];
}
