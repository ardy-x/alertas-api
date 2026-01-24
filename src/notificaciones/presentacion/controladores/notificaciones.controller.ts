import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { EnviarNotificacionUseCase } from '../../aplicacion/casos-uso/enviar-notificacion.use-case';
import { EnviarNotificacionRequestDto } from '../dto/entrada/notificacion-entrada.dto';

@ApiTags('NOTIFICACIONES')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Enviar notificación push' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: RespuestaBaseDto,
  })
  async enviarNotificacion(@Body() dto: EnviarNotificacionRequestDto): Promise<RespuestaBaseDto> {
    await this.enviarNotificacionUseCase.ejecutar({
      fcmToken: dto.fcmToken,
      titulo: dto.titulo,
      cuerpo: dto.cuerpo,
      datos: dto.datos,
      tipoDestinatario: dto.tipoDestinatario,
    });

    return RespuestaBuilder.exito(HttpStatus.OK, 'Notificación enviada exitosamente');
  }
}
