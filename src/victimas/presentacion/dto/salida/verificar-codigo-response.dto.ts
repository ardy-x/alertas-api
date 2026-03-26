import { ApiProperty } from '@nestjs/swagger';

export class VictimaVerificadaDto {
  @ApiProperty({ description: 'ID único de la víctima' })
  id: string;

  @ApiProperty({ description: 'API Key generada para la víctima' })
  apiKey: string;
}

export class VerificarCodigoResponseDto {
  @ApiProperty({ type: VictimaVerificadaDto })
  victima: VictimaVerificadaDto;
}
