import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { AsignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/asignar-investigador.use-case';
import { DesasignarInvestigadorUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/desasignar-investigador.use-case';
import { ListarHistorialInvestigadoresUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/listar-historial-investigadores.use-case';
import { ObtenerInvestigadorActivoUseCase } from '@/victimas/aplicacion/casos-uso/investigadores/obtener-investigador-activo.use-case';
import { AsignarInvestigadorDto } from '../dtos/entrada/asignar-investigador.dto';
import { InvestigadorActivoDto, ListarHistorialInvestigadoresResponseDto } from '../dtos/salida/investigador.dto';

@ApiTags('VÍCTIMAS WEB')
@Controller('victimas')
@UseGuards(KerberosJwtAuthGuard)
@ApiSecurity('jwt-auth')
export class InvestigadoresController {
  constructor(
    private readonly asignarInvestigadorUseCase: AsignarInvestigadorUseCase,
    private readonly desasignarInvestigadorUseCase: DesasignarInvestigadorUseCase,
    private readonly obtenerInvestigadorActivoUseCase: ObtenerInvestigadorActivoUseCase,
    private readonly listarHistorialInvestigadoresUseCase: ListarHistorialInvestigadoresUseCase,
  ) {}

  @Post(':idVictima/investigador')
  @ApiOperation({ summary: 'Asignar investigador a una víctima' })
  async asignarInvestigador(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() dto: AsignarInvestigadorDto): Promise<RespuestaBaseDto> {
    await this.asignarInvestigadorUseCase.ejecutar(idVictima, dto.ciInvestigador, dto.observaciones);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Investigador asignado exitosamente');
  }

  @Delete(':idVictima/investigador')
  @ApiOperation({ summary: 'Desasignar investigador de una víctima' })
  async desasignarInvestigador(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.desasignarInvestigadorUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Investigador desasignado exitosamente');
  }

  @Get(':idVictima/investigador')
  @ApiOperation({ summary: 'Obtener investigador activo de una víctima' })
  async obtenerInvestigadorActivo(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<InvestigadorActivoDto | null>> {
    const investigador = await this.obtenerInvestigadorActivoUseCase.ejecutar(idVictima);

    if (!investigador) {
      return RespuestaBuilder.exito(HttpStatus.OK, 'No hay investigador asignado', null);
    }

    return RespuestaBuilder.exito(HttpStatus.OK, 'Investigador obtenido exitosamente', investigador);
  }

  @Get(':idVictima/investigadores/historial')
  @ApiOperation({ summary: 'Listar historial de investigadores de una víctima' })
  async listarHistorialInvestigadores(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<ListarHistorialInvestigadoresResponseDto>> {
    const investigadores = await this.listarHistorialInvestigadoresUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de investigadores obtenido exitosamente', { investigadores });
  }
}
