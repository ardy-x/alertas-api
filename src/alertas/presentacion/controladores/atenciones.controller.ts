import { Body, Controller, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { AgregarFuncionarioUseCase } from '@/alertas/aplicacion/casos-uso/atenciones/agregar-funcionario.use-case';
import { CrearAtencionCompletaUseCase } from '@/alertas/aplicacion/casos-uso/atenciones/crear-atencion-completa.use-case';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { CrearAtencionCompletaRequestDto, CrearFuncionarioAtencionRequestDto } from '../dto/entrada/atenciones-entrada.dto';

@ApiTags('ATENCIONES')
@Controller('atenciones')
@UseGuards(KerberosJwtAuthGuard)
@ApiSecurity('jwt-auth')
export class AtencionesController {
  constructor(
    private readonly crearAtencionCompletaUseCase: CrearAtencionCompletaUseCase,
    private readonly agregarFuncionarioUseCase: AgregarFuncionarioUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear atención completa con funcionarios' })
  @ApiBody({ type: CrearAtencionCompletaRequestDto })
  async crearAtencionCompleta(@IdUsuarioActual() idUsuarioWeb: string, @Body() entrada: CrearAtencionCompletaRequestDto): Promise<RespuestaBaseDto> {
    await this.crearAtencionCompletaUseCase.ejecutar(entrada, idUsuarioWeb);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Atención con funcionarios asignada exitosamente');
  }

  @Post(':idAtencion/funcionarios')
  @ApiOperation({ summary: 'Agregar funcionario a atención existente' })
  @ApiBody({ type: CrearFuncionarioAtencionRequestDto })
  async agregarFuncionario(@Param('idAtencion', ParseUUIDPipe) idAtencion: string, @Body() entrada: CrearFuncionarioAtencionRequestDto): Promise<RespuestaBaseDto> {
    await this.agregarFuncionarioUseCase.ejecutar(idAtencion, entrada);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Funcionario agregado exitosamente a la atención');
  }
}
