import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { RolesPermitidos } from '@/autenticacion/dominio/enums/roles-permitidos.enum';
import { IdUsuarioActual } from '@/autenticacion/infraestructura/decoradores/id-usuario.decorator';
import { RolUsuarioActual } from '@/autenticacion/infraestructura/decoradores/rol-usuario.decorator';
import { Roles } from '@/autenticacion/infraestructura/decoradores/roles-permitidos.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RolesGuard } from '@/autenticacion/infraestructura/guards/roles.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { PaginacionRespuestaBaseDto, RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ActivarCuentaUseCase } from '@/victimas/aplicacion/casos-uso/web/activar-cuenta.use-case';
import { ListarVictimasUseCase } from '@/victimas/aplicacion/casos-uso/web/listar-victimas.use-case';
import { ObtenerHistorialAlertasVictimaUseCase } from '@/victimas/aplicacion/casos-uso/web/obtener-historial-alertas-victima.use-case';
import { SuspenderCuentaUseCase } from '@/victimas/aplicacion/casos-uso/web/suspender-cuenta.use-case';
import { ListarVictimasRequestDto, ObtenerHistorialAlertasParamsDto } from '../dto/entrada/victima.dto';
import { HistorialAlertasVictimaDto } from '../dto/salida/historial-alertas-victima.dto';
import { ListarVictimasData } from '../dto/salida/victima.dto';

@ApiTags('VÍCTIMAS WEB')
@ApiSecurity('jwt-auth')
@ApiRespuestasComunes()
@Controller('victimas')
@UseGuards(KerberosJwtAuthGuard, RolesGuard)
@Roles(RolesPermitidos.ADMINISTRADOR)
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
  @ApiResponse({ status: HttpStatus.OK, type: ListarVictimasData })
  async listarTodas(@Query() query: ListarVictimasRequestDto, @IdUsuarioActual() idUsuario: string, @RolUsuarioActual() rolUsuario: string): Promise<PaginacionRespuestaBaseDto<ListarVictimasData>> {
    const resultado = await this.listarVictimasUseCase.ejecutar(query, idUsuario, rolUsuario);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Víctimas listadas exitosamente', resultado);
  }

  @Get('historial-alertas')
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por CI', description: 'Consulta para el sistema JUPITER' })
  @ApiResponse({ status: HttpStatus.OK, type: HistorialAlertasVictimaDto })
  async obtenerHistorialAlertas(@Query() query: ObtenerHistorialAlertasParamsDto): Promise<RespuestaBaseDto> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial) as RespuestaBaseDto;
  }

  @Get(':idVictima/historial-alertas')
  @Roles(RolesPermitidos.ADMINISTRADOR, RolesPermitidos.INVESTIGADOR)
  @ApiOperation({ summary: 'Obtener historial de alertas de una víctima por ID', description: 'Roles permitidos: ADMINISTRADOR, INVESTIGADOR' })
  @ApiResponse({ status: HttpStatus.OK, type: HistorialAlertasVictimaDto })
  async obtenerHistorialAlertasPorId(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<HistorialAlertasVictimaDto>> {
    const historial = await this.obtenerHistorialAlertasVictimaUseCase.ejecutar({ idVictima });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Historial de alertas obtenido exitosamente', historial);
  }
  @Post(':idVictima/suspender-cuenta')
  @ApiOperation({ summary: 'Suspender cuenta de víctima', description: 'Rol permitido: ADMINISTRADOR' })
  async suspenderCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.suspenderCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta suspendida exitosamente');
  }

  @Post(':idVictima/activar-cuenta')
  @ApiOperation({ summary: 'Activar cuenta de víctima', description: 'Rol permitido: ADMINISTRADOR' })
  async activarCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.activarCuentaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cuenta activada exitosamente');
  }
}
