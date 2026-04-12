import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNotEmpty, IsString, IsUUID, Length } from 'class-validator';

import { CanalSolicitudCodigo } from './solicitar-codigo-request.dto';

export class VerificarCodigoRequestDto {
  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  idVictima: string;

  @ApiProperty({
    description: 'Canal por el cual se solicitó el código',
    enum: CanalSolicitudCodigo,
    example: CanalSolicitudCodigo.WHATSAPP,
  })
  @IsEnum(CanalSolicitudCodigo)
  canal: CanalSolicitudCodigo;

  @ApiProperty({
    description: 'Código de verificación de 6 dígitos',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  codigo: string;
}
