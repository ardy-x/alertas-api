import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { CiUsuarioActual } from '@/autenticacion/infraestructura/decoradores/ci-usuario.decorator';
import { RolUsuarioActual } from '@/autenticacion/infraestructura/decoradores/rol-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
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
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
export class VictimasWebController {
  constructor(
    private readonly listarVictimasUseCase: ListarVictimasUseCase,
    private readonly obtenerHistorialAlertasVictimaUseCase: ObtenerHistorialAlertasVictimaUseCase,
    private readonly suspenderCuentaUseCase: SuspenderCuentaUseCase,
    private readonly activarCuentaUseCase: ActivarCuentaUseCase,
  ) {}

  @Get()
  @Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Listar víctimas con filtros y paginación', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR' })
  async listarTodas(@Query() query: ListarVictimasRequestDto, @CiUsuarioActual() ciUsuario: string, @RolUsuarioActual() rolUsuario: string): Promise<PaginacionRespuestaBaseDto<ListarVictimasData>> {
    const resultado = await this.listarVictimasUseCase.ejecutar(query, ciUsuario, rolUsuario);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Víctimas listadas exitosamente', resultado);
  }

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por CI', description: 'Consulta para el sistema JUPITER' })
  async obtenerHistorialAlertas(@Query() query: ObtenerHistorialAlertasParamsDto): Promise<RespuestaBaseDto> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial) as RespuestaBaseDto;
  }

  @Get(':idVictima/historial-alertas')
  @Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por ID', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR' })
  async obtenerHistorialAlertasPorId(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar({ idVictima });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial) as RespuestaBaseDto;
  }
  @Post(':idVictima/suspender-cuenta')
  @Roles(RolesPermitidos.ADMINISTRADOR)
  @ApiOperation({ summary: 'Suspender cuenta de víctima', description: 'Rol permitido: ADMINISTRADOR' })
  async suspenderCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.suspenderCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta suspendida exitosamente');
  }

  @Post(':idVictima/activar-cuenta')
  @Roles(RolesPermitidos.ADMINISTRADOR)
  @ApiOperation({ summary: 'Activar cuenta de víctima', description: 'Rol permitido: ADMINISTRADOR' })
  async activarCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.activarCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta activada exitosamente');
  }
}
