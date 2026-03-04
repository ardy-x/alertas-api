import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { CerrarAlertaUseCase } from '@/alertas/aplicacion/casos-uso/cierre-alertas/cerrar-alerta.use-case';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { CerrarAlertaRequestDto } from '../dto/entrada/cierre-alertas-entrada.dto';

@ApiTags('CIERRE DE ALERTAS')
@Controller('cierre-alertas')
@UseGuards(KerberosJwtAuthGuard)
@ApiSecurity('jwt-auth')
export class CierreAlertasController {
  constructor(private readonly cerrarAlertaUseCase: CerrarAlertaUseCase) {}
  @Post(':idAlerta')
  @ApiOperation({ summary: 'Cerrar alerta' })
  @ApiParam({ name: 'idAlerta', description: 'ID de la alerta' })
  @ApiBody({ type: CerrarAlertaRequestDto })
  async cerrarAlerta(@Param('idAlerta', ParseUUIDPipe) idAlerta: string, @IdUsuarioActual() idUsuarioWeb: string, @Body() entrada: CerrarAlertaRequestDto): Promise<RespuestaBaseDto> {
    await this.cerrarAlertaUseCase.ejecutar(idAlerta, idUsuarioWeb, entrada);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Alerta cerrada exitosamente');
  }
}
