import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AsignarInvestigadorDto {
  @ApiProperty({ example: '' })
  @IsNotEmpty()
  @IsString()
  declare idUsuarioInvestigador: string;

  @ApiProperty({ example: '' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
