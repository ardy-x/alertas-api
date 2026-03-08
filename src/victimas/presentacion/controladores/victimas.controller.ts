import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { LogDatosInterceptor } from '@/core/interceptores/log-datos.interceptor';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ActualizarDatosContactoUseCase } from '@/victimas/aplicacion/casos-uso/actualizar-datos-contacto.use-case';
import { ActualizarDatosCuentaUseCase } from '@/victimas/aplicacion/casos-uso/actualizar-datos-cuenta.use-case';
import { ActualizarPermisosUseCase } from '@/victimas/aplicacion/casos-uso/actualizar-permisos.use-case';
import { ActualizarUbicacionUseCase } from '@/victimas/aplicacion/casos-uso/actualizar-ubicacion.use-case';
import { CerrarSesionUseCase } from '@/victimas/aplicacion/casos-uso/cerrar-sesion.use-case';
import { CrearVictimaUseCase } from '@/victimas/aplicacion/casos-uso/crear-victima.use-case';
import { ObtenerVictimaUseCase } from '@/victimas/aplicacion/casos-uso/obtener-victima.use-case';
import { VerificarDenunciaUseCase } from '@/victimas/aplicacion/casos-uso/verificar-denuncia.use-case';
import { VerificarVictimaUseCase } from '@/victimas/aplicacion/casos-uso/verificar-victima.use-case';
import { ClaveApiGuard } from '../../infraestructura/guards/clave-api.guard';
import { PermisosAppDto } from '../dto/entrada/permisos-app.dto';
import { VerificarDenunciaRequestDto } from '../dto/entrada/verificar-denuncia.dto';
import { ActualizarDatosContactoRequestDto, ActualizarDatosCuentaRequestDto, ActualizarUbicacionRequestDto, CrearVictimaRequestDto, VerificarVictimaParamsDto } from '../dto/entrada/victima.dto';
import { VictimaDto } from '../dto/salida/verificar-denuncia.dto';
import { VerificarVictimaResponse, VictimaResponseDto } from '../dto/salida/victima.dto';
@ApiTags('VÍCTIMAS')
@ApiRespuestasComunes()
@Controller('victimas')
@UseInterceptors(LogDatosInterceptor)
export class VictimasController {
  constructor(
    private readonly crearVictimaUseCase: CrearVictimaUseCase,
    private readonly obtenerVictimaUseCase: ObtenerVictimaUseCase,
    private readonly actualizarDatosContactoUseCase: ActualizarDatosContactoUseCase,
    private readonly actualizarUbicacionUseCase: ActualizarUbicacionUseCase,
    private readonly actualizarDatosCuentaUseCase: ActualizarDatosCuentaUseCase,
    private readonly verificarVictimaUseCase: VerificarVictimaUseCase,
    private readonly verificarDenunciaUseCase: VerificarDenunciaUseCase,
    private readonly cerrarSesionUseCase: CerrarSesionUseCase,
    private readonly actualizarPermisosUseCase: ActualizarPermisosUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva víctima' })
  @ApiBody({ type: CrearVictimaRequestDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: RespuestaBaseDto, description: 'Víctima creada exitosamente' })
  async crear(@Body() crearVictimaDto: CrearVictimaRequestDto): Promise<RespuestaBaseDto<{ victima: { id: string } }>> {
    const resultado = await this.crearVictimaUseCase.ejecutar(crearVictimaDto);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Víctima creada exitosamente', resultado);
  }

  @Get('verificar')
  @ApiOperation({ summary: 'Verificar existencia de víctima por CI' })
  @ApiResponse({ status: HttpStatus.OK, type: VerificarVictimaResponse, description: 'Verificación completada' })
  async verificarPorCi(@Query() params: VerificarVictimaParamsDto): Promise<RespuestaBaseDto<VerificarVictimaResponse>> {
    const resultado = await this.verificarVictimaUseCase.ejecutar(params);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Verificación completada', resultado);
  }

  @Get('/verificar-denuncia')
  @ApiOperation({ summary: 'Verificar denuncia' })
  @ApiResponse({ status: HttpStatus.OK, type: VictimaDto, description: 'Denuncia verificada exitosamente' })
  async verificarDenuncia(@Query() request: VerificarDenunciaRequestDto): Promise<RespuestaBaseDto<{ victima: VictimaDto }>> {
    const victima = await this.verificarDenunciaUseCase.ejecutar(request.codigoDenuncia, request.cedulaIdentidad);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Denuncia verificada exitosamente', { victima });
  }

  @Get(':idVictima')
  @UseGuards(ClaveApiGuard)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Obtener datos de la cuenta del BP víctima' })
  @ApiResponse({ status: HttpStatus.OK, type: VictimaResponseDto, description: 'Datos de la víctima obtenidos exitosamente' })
  async obtenerPorId(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto<{ victima: VictimaResponseDto }>> {
    const resultado = await this.obtenerVictimaUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Víctima obtenida exitosamente', { victima: resultado });
  }

  @Patch(':idVictima/contacto')
  @UseGuards(ClaveApiGuard)
  @ApiOperation({ summary: 'Actualizar datos de contacto de la víctima' })
  @ApiSecurity('api-key')
  @ApiBody({ type: ActualizarDatosContactoRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Datos de contacto actualizados exitosamente' })
  async actualizarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() actualizarDatosContactoDto: ActualizarDatosContactoRequestDto): Promise<RespuestaBaseDto> {
    await this.actualizarDatosContactoUseCase.ejecutar(idVictima, actualizarDatosContactoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Datos de contacto actualizados exitosamente');
  }

  @Patch(':idVictima/ubicacion')
  @UseGuards(ClaveApiGuard)
  @ApiOperation({ summary: 'Actualizar ubicación de la víctima' })
  @ApiSecurity('api-key')
  @ApiBody({ type: ActualizarUbicacionRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Ubicación actualizada exitosamente' })
  async actualizarUbicacion(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() actualizarUbicacionDto: ActualizarUbicacionRequestDto): Promise<RespuestaBaseDto> {
    await this.actualizarUbicacionUseCase.ejecutar(idVictima, actualizarUbicacionDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Ubicación actualizada exitosamente');
  }

  @Patch(':idVictima/cuenta')
  @UseGuards(ClaveApiGuard)
  @ApiOperation({ summary: 'Actualizar datos de cuenta de la víctima' })
  @ApiSecurity('api-key')
  @ApiBody({ type: ActualizarDatosCuentaRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Datos de cuenta actualizados exitosamente' })
  async actualizarCuenta(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() actualizarDatosCuentaDto: ActualizarDatosCuentaRequestDto) {
    await this.actualizarDatosCuentaUseCase.ejecutar(idVictima, actualizarDatosCuentaDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Datos de cuenta actualizados exitosamente');
  }

  @Patch(':idVictima/cerrar-sesion')
  @UseGuards(ClaveApiGuard)
  @ApiOperation({ summary: 'Cerrar sesión de la víctima (cambiar estado a INACTIVA)' })
  @ApiSecurity('api-key')
  @ApiResponse({ status: HttpStatus.OK, description: 'Sesión cerrada exitosamente' })
  async cerrarSesion(@Param('idVictima', ParseUUIDPipe) idVictima: string): Promise<RespuestaBaseDto> {
    await this.cerrarSesionUseCase.ejecutar(idVictima);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Sesión cerrada exitosamente');
  }

  @Patch(':idVictima/permisos')
  @UseGuards(ClaveApiGuard)
  @ApiOperation({ summary: 'Actualizar permisos de la aplicación' })
  @ApiSecurity('api-key')
  @ApiBody({ type: PermisosAppDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permisos actualizados exitosamente' })
  async actualizarPermisos(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() permisosDto: PermisosAppDto): Promise<RespuestaBaseDto> {
    await this.actualizarPermisosUseCase.ejecutar(idVictima, permisosDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Permisos actualizados exitosamente');
  }
}
