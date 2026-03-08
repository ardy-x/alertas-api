import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { AsignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/asignar-investigador.use-case';
import { DesasignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/desasignar-investigador.use-case';
import { ListarHistorialInvestigadoresUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/listar-historial-investigadores.use-case';
import { ObtenerInvestigadorActivoUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/obtener-investigador-activo.use-case';
import { AsignarInvestigadorDto } from '../dtos/entrada/asignar-investigador.dto';
import { InvestigadorActivoDto, ListarHistorialInvestigadoresResponseDto } from '../dtos/salida/investigador.dto';

@ApiTags('VÍCTIMAS WEB')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('victimas')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
export class InvestigadoresController {
  constructor(
    private readonly asignarInvestigadorUseCase: AsignarInvestigadorUseCase,
    private readonly desasignarInvestigadorUseCase: DesasignarInvestigadorUseCase,
    private readonly obtenerInvestigadorActivoUseCase: ObtenerInvestigadorActivoUseCase,
    private readonly listarHistorialInvestigadoresUseCase: ListarHistorialInvestigadoresUseCase,
  ) {}

  @Post(':idVictima/investigador')
  @ApiOperation({ summary: 'Asignar investigador a una víctima', description: 'Rol permitido: ADMINISTRADOR.' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Investigador asignado exitosamente' })
  async asignarInvestigador(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() dto: AsignarInvestigadorDto, @IdUsuarioActual() idUsuarioAsignador: string): Promise<RespuestaBaseDto> {
    await this.asignarInvestigadorUseCase.ejecutar(idVictima, dto.ciInvestigador, idUsuarioAsignador, dto.observaciones);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Investigador asignado exitosamente');
  }

  @Delete(':idVictima/investigador')
  @ApiOperation({ summary: 'Desasignar investigador de una víctima', description: 'Rol permitido: ADMINISTRADOR.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Investigador desasignado exitosamente' })
  async desasignarInvestigador(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.desasignarInvestigadorUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Investigador desasignado exitosamente');
  }

  @Get(':idVictima/investigador')
  @ApiOperation({ summary: 'Obtener investigador activo de una víctima' })
  @ApiResponse({ status: HttpStatus.OK, type: InvestigadorActivoDto, description: 'Investigador activo obtenido exitosamente' })
  async obtenerInvestigadorActivo(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<InvestigadorActivoDto | null>> {
    const investigador = await this.obtenerInvestigadorActivoUseCase.ejecutar(idVictima);

    if (!investigador) {
      return RespuestaBuilder.exito(HttpStatus.OK, 'No hay investigador asignado', null);
    }

    return RespuestaBuilder.exito(HttpStatus.OK, 'Investigador obtenido exitosamente', investigador);
  }

  @Get(':idVictima/investigadores/historial')
  @ApiOperation({ summary: 'Listar historial de investigadores de una víctima', description: 'Rol permitido: ADMINISTRADOR.' })
  @ApiResponse({ status: HttpStatus.OK, type: ListarHistorialInvestigadoresResponseDto, description: 'Historial de investigadores obtenido exitosamente' })
  async listarHistorialInvestigadores(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<ListarHistorialInvestigadoresResponseDto>> {
    const investigadores = await this.listarHistorialInvestigadoresUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de investigadores obtenido exitosamente', { investigadores });
  }
}
