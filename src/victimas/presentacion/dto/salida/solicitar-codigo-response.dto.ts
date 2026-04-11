import { ApiProperty } from '@nestjs/swagger';

import { CanalSolicitudCodigo } from '../entrada/validacion/solicitar-codigo-request.dto';

export class SolicitarCodigoResponseDto {
  @ApiProperty({ description: 'Indica si el código fue enviado correctamente', example: true })
  declare codigoEnviado: boolean;

  @ApiProperty({ description: 'Canal por el cual se envió el código', enum: CanalSolicitudCodigo, example: CanalSolicitudCodigo.WHATSAPP })
  declare canal: CanalSolicitudCodigo;

  @ApiProperty({ description: 'Destino enmascarado para mostrar en UI', example: '7****230' })
  declare enviadoA: string;
}
