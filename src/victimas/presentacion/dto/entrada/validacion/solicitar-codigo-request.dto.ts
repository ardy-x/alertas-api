import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum CanalSolicitudCodigo {
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export class SolicitarCodigoRequestDto {
  @ApiProperty({
    description: 'ID de la víctima',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
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
