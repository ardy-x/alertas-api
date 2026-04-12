import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum CanalSolicitudCodigo {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export class SolicitarCodigoRequestDto {
  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  declare idVictima: string;

  @ApiProperty({
    description: 'Canal por el cual se enviará el código',
    enum: CanalSolicitudCodigo,
    example: CanalSolicitudCodigo.WHATSAPP,
  })
  @IsEnum(CanalSolicitudCodigo)
  declare canal: CanalSolicitudCodigo;
}
