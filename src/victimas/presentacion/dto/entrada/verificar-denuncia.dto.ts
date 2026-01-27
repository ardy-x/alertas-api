import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerificarDenunciaRequestDto {
  @ApiProperty({ example: '1-030-20-00-25-00003' })
  @IsString()
  @IsNotEmpty()
  codigoDenuncia: string;

  @ApiProperty({ example: '6666' })
  @IsString()
  @IsNotEmpty()
  cedulaIdentidad: string;
}
