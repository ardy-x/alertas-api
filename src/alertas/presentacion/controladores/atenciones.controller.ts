import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AgregarFuncionarioUseCase } from '@/alertas/aplicacion/casos-uso/atenciones/agregar-funcionario.use-case';
import { CrearAtencionCompletaUseCase } from '@/alertas/aplicacion/casos-uso/atenciones/crear-atencion-completa.use-case';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { CrearAtencionCompletaRequestDto, CrearFuncionarioAtencionRequestDto } from '../dto/entrada/atenciones-entrada.dto';

@ApiTags('ATENCIONES')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('atenciones')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.OPERADOR)
export class AtencionesController {
  constructor(
    private readonly crearAtencionCompletaUseCase: CrearAtencionCompletaUseCase,
    private readonly agregarFuncionarioUseCase: AgregarFuncionarioUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Asignar personal policial', description: 'Roles permitidos: ADMINISTRADO, OPERADOR' })
  @ApiBody({ type: CrearAtencionCompletaRequestDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Se asignó correctamente el personal policial' })
  async crearAtencionCompleta(@IdUsuarioActual() idUsuarioWeb: string, @Body() entrada: CrearAtencionCompletaRequestDto): Promise<RespuestaBaseDto> {
    await this.crearAtencionCompletaUseCase.ejecutar(entrada, idUsuarioWeb);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Se asignó correctamente el personal policial');
  }

  @Post(':idAtencion/funcionarios')
  @ApiOperation({ summary: 'Agregar personal policial', description: 'Roles permitidos: ADMINISTRADOR, OPERADOR' })
  @ApiBody({ type: CrearFuncionarioAtencionRequestDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Se agregó correctamente el personal policial' })
  async agregarFuncionario(@Param('idAtencion', ParseUUIDPipe) idAtencion: string, @Body() entrada: CrearFuncionarioAtencionRequestDto): Promise<RespuestaBaseDto> {
    await this.agregarFuncionarioUseCase.ejecutar(idAtencion, entrada);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Se agregó correctamente el personal policial');
  }
}
