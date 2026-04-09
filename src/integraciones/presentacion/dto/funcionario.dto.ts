import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator';
import { PaginacionQueryDto } from '@/core/dto/paginacion-query.dto';
import { PaginacionDto } from '@/core/dto/paginacion-response.dto';

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

export class ListarFuncionariosQueryDto extends PaginacionQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare idUnidad?: number;
}

export class ListarFuncionariosResponseDto {
  @ApiProperty({ type: [FuncionarioDto] })
  declare funcionarios: FuncionarioDto[];

  @ApiProperty({ type: PaginacionDto })
  declare paginacion: PaginacionDto;
}
