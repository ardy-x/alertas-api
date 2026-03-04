import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { PaginacionRespuestaBaseDto, RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ActivarCuentaUseCase } from '@/victimas/aplicacion/casos-uso/activar-cuenta.use-case';
import { ListarVictimasUseCase } from '@/victimas/aplicacion/casos-uso/listar-victimas.use-case';
import { ObtenerHistorialAlertasVictimaUseCase } from '@/victimas/aplicacion/casos-uso/obtener-historial-alertas-victima.use-case';
import { SuspenderCuentaUseCase } from '@/victimas/aplicacion/casos-uso/suspender-cuenta.use-case';

import { ListarVictimasRequestDto, ObtenerHistorialAlertasParamsDto } from '../dto/entrada/victima.dto';
import { ListarVictimasData } from '../dto/salida/victima.dto';

@ApiTags('VÍCTIMAS WEB')
@Controller('victimas')
@ApiSecurity('jwt-auth')
@UseGuards(KerberosJwtAuthGuard)
export class VictimasWebController {
  constructor(
    private readonly listarVictimasUseCase: ListarVictimasUseCase,
    private readonly obtenerHistorialAlertasVictimaUseCase: ObtenerHistorialAlertasVictimaUseCase,
    private readonly suspenderCuentaUseCase: SuspenderCuentaUseCase,
    private readonly activarCuentaUseCase: ActivarCuentaUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar víctimas con filtros y paginación' })
  async listarTodas(@Query() query: ListarVictimasRequestDto): Promise<PaginacionRespuestaBaseDto<ListarVictimasData>> {
    const resultado = await this.listarVictimasUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Víctimas listadas exitosamente', resultado);
  }

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por CI' })
  async obtenerHistorialAlertas(@Query() query: ObtenerHistorialAlertasParamsDto): Promise<RespuestaBaseDto> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial) as RespuestaBaseDto;
  }

  @Get(':idVictima/historial-alertas')
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por ID' })
  async obtenerHistorialAlertasPorId(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar({ idVictima });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial) as RespuestaBaseDto;
  }
  @Post(':idVictima/suspender-cuenta')
  @ApiOperation({ summary: 'Suspender cuenta de víctima' })
  async suspenderCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.suspenderCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta suspendida exitosamente');
  }

  @Post(':idVictima/activar-cuenta')
  @ApiOperation({ summary: 'Activar cuenta de víctima' })
  async activarCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.activarCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta activada exitosamente');
  }
}
