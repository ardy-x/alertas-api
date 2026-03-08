import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class BuscarFuncionarioQueryDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/)
  declare ci: string;
}

export class FuncionarioDto {
  @ApiProperty()
  declare cedulaIdentidad: string;

  @ApiProperty()
  declare nombreCompleto: string;

  @ApiProperty()
  declare nroEscalafon: string;

  @ApiProperty()
  declare grado: string;

  @ApiProperty()
  declare unidad: string;

  @ApiProperty()
  declare cargo: string;

  @ApiProperty()
  declare procesoDisciplinario: boolean;
}

export class BuscarFuncionarioResponseDto {
  @ApiProperty({ type: [FuncionarioDto] })
  declare funcionarios: FuncionarioDto[];
}
