import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { EnviarNotificacionUseCase } from '../../aplicacion/casos-uso/enviar-notificacion.use-case';
import { EnviarNotificacionRequestDto } from '../dto/entrada/notificacion-entrada.dto';

@ApiTags('NOTIFICACIONES')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('notificaciones')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
export class NotificacionesController {
  constructor(private readonly enviarNotificacionUseCase: EnviarNotificacionUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Enviar notificación push', description: 'Rol permitido: ADMINISTRADOR' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Notifiicación enviada correctamente', type: RespuestaBaseDto })
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
