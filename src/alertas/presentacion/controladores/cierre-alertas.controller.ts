import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CerrarAlertaUseCase } from '@/alertas/aplicacion/casos-uso/cierre-alertas/cerrar-alerta.use-case';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { CerrarAlertaRequestDto } from '../dto/entrada/cierre-alertas-entrada.dto';

@ApiTags('CIERRE DE ALERTAS')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('cierre-alertas')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR)
export class CierreAlertasController {
  constructor(private readonly cerrarAlertaUseCase: CerrarAlertaUseCase) {}
  @Post(':idAlerta')
  @ApiOperation({ summary: 'Cerrar alerta', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiBody({ type: CerrarAlertaRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Alerta cerrada exitosamente' })
  async cerrarAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @IdUsuarioActual() idUsuarioWeb: string, @Body() entrada: CerrarAlertaRequestDto): Promise<RespuestaBaseDto> {
    await this.cerrarAlertaUseCase.ejecutar(idAlerta, idUsuarioWeb, entrada);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta cerrada exitosamente');
  }
}
