import { Body, Controller, Get, HttpStatus, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { PaginacionRespuestaBaseDto, RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { ListarUsuariosWebUseCase } from '../../aplicacion/casos-uso/listar-usuarios-web.use-case';
import { ObtenerUsuarioWebUseCase } from '../../aplicacion/casos-uso/obtener-usuario-web.use-case';
import { RegistrarTokenFCMUseCase } from '../../aplicacion/casos-uso/registrar-token-fcm.use-case';
import { ListarUsuariosWebRequestDto } from '../dto/entrada/listar-usuarios-web-entrada.dto';
import { RegistrarTokenFCMRequestDto } from '../dto/entrada/usuarios-web-entrada.dto';
import { ListarUsuariosWebResponseDto, UsuarioWebResponseDto } from '../dto/salida/usuarios-web-salida.dto';

@ApiTags('USUARIOS WEB')
@Controller('usuarios-web')
export class UsuariosWebController {
  constructor(
    private readonly registrarTokenFCMUseCase: RegistrarTokenFCMUseCase,
    private readonly obtenerUsuarioWebUseCase: ObtenerUsuarioWebUseCase,
    private readonly listarUsuariosWebUseCase: ListarUsuariosWebUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios del web' })
  async listarUsuarios(@Query() query: ListarUsuariosWebRequestDto): Promise<PaginacionRespuestaBaseDto<ListarUsuariosWebResponseDto>> {
    const resultado = await this.listarUsuariosWebUseCase.ejecutar(query);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Usuarios obtenidos exitosamente', resultado);
  }

  @Get(':idUsuarioWeb/perfil')
  @ApiOperation({ summary: 'Obtener perfil del usuario' })
  async obtenerPerfil(@Param('idUsuarioWeb', ParseUUIDPipe) idUsuarioWeb: string): Promise<RespuestaBaseDto<{ usuarioWeb: UsuarioWebResponseDto }>> {
    const usuarioWeb = await this.obtenerUsuarioWebUseCase.ejecutar(idUsuarioWeb);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Usuario obtenido exitosamente', { usuarioWeb });
  }

  @Patch(':idUsuarioWeb/token-fcm')
  @ApiOperation({ summary: 'Actualizar token FCM' })
  async registrarTokenFCM(@Param('idUsuarioWeb', ParseUUIDPipe) idUsuarioWeb: string, @Body() dto: RegistrarTokenFCMRequestDto): Promise<RespuestaBaseDto> {
    await this.registrarTokenFCMUseCase.ejecutar(dto, idUsuarioWeb);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Token FCM registrado exitosamente');
  }
}
