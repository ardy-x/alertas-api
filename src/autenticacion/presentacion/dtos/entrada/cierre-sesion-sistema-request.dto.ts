import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CierreSesionSistemaRequestDto {
  @ApiProperty()
  @IsUUID()
  idSistema: string;
}
