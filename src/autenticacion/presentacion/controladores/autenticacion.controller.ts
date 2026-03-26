import { BadRequestException, Body, Controller, Get, Headers, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IdSistemaActual } from '@/autenticacion/infraestructura/decoradores/id-sistema.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { CierreSesionSistemaUseCase } from '../../aplicacion/casos-uso/cierre-sesion-sistema.use-case';
import { DecodificarTokenUseCase } from '../../aplicacion/casos-uso/decodificar-token.use-case';
import { ObtenerUsuariosSistemaUseCase } from '../../aplicacion/casos-uso/obtener-usuarios-sistema.use-case';
import { RefreshTokenUseCase } from '../../aplicacion/casos-uso/refresh-token.use-case';
import { CierreSesionSistemaRequestDto } from '../dtos/entrada/cierre-sesion-sistema-request.dto';
import { DecodificarTokenRequestDto } from '../dtos/entrada/decodificar-token-request.dto';
import { ObtenerUsuariosSistemaQueryDto } from '../dtos/entrada/obtener-usuarios-sistema-query.dto';
import { DecodificarTokenDatosDto } from '../dtos/salida/decodificar-token-response.dto';
import { ObtenerUsuariosSistemaDatosDto } from '../dtos/salida/obtener-usuarios-sistema-response.dto';
import { RefreshTokenResponseDto } from '../dtos/salida/refresh-token-response.dto';

@ApiTags('AUTENTICACIÓN')
@Controller('autenticacion')
@ApiRespuestasComunes()
export class AutenticacionController {
  constructor(
    private readonly decodificarTokenUseCase: DecodificarTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly cierreSesionSistemaUseCase: CierreSesionSistemaUseCase,
    private readonly obtenerUsuariosSistemaUseCase: ObtenerUsuariosSistemaUseCase,
  ) {}

  @Post('intercambio-codigo')
  @ApiOperation({ summary: 'Decodificar token JWT' })
  @ApiBody({ type: DecodificarTokenRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token decodificado exitosamente', type: DecodificarTokenDatosDto })
  async decodificarToken(@Body() request: DecodificarTokenRequestDto): Promise<RespuestaBaseDto<DecodificarTokenDatosDto>> {
    const resultado = await this.decodificarTokenUseCase.ejecutar(request);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Token decodificado exitosamente', resultado);
  }

  @Post('cierre-sesion-sistema')
  @UseGuards(KerberosJwtAuthGuard)
  @ApiOperation({ summary: 'Termina la sesión del usuario en el sistema' })
  @ApiBody({ type: CierreSesionSistemaRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cierre de sesión del sistema completado exitosamente' })
  async cierreSesionSistema(@Body() dto: CierreSesionSistemaRequestDto, @Headers('authorization') authHeader: string): Promise<RespuestaBaseDto<void>> {
    const accessToken = authHeader.replace('Bearer ', '');
    await this.cierreSesionSistemaUseCase.ejecutar(dto.idSistema, accessToken);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cierre de sesión del sistema completado exitosamente');
  }

  @Get('usuarios')
  @UseGuards(KerberosJwtAuthGuard)
  @ApiOperation({ summary: 'Listar usuarios del sistema' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Usuarios del sistema devueltos correctamente', type: ObtenerUsuariosSistemaDatosDto })
  async obtenerUsuariosSistema(
    @IdSistemaActual() idSistemaActual: string,
    @Query() query: ObtenerUsuariosSistemaQueryDto,
    @Headers('authorization') authHeader: string,
  ): Promise<RespuestaBaseDto<ObtenerUsuariosSistemaDatosDto>> {
    const accessToken = authHeader.replace('Bearer ', '');
    const resultado = await this.obtenerUsuariosSistemaUseCase.ejecutar(idSistemaActual, query, accessToken);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Usuarios obtenidos exitosamente', resultado);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Renovar tokens' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Renovación de tokens exitosa', type: RefreshTokenResponseDto })
  async refreshToken(@Headers('authorization') refreshToken: string): Promise<RespuestaBaseDto<RefreshTokenResponseDto>> {
    if (!refreshToken) {
      throw new BadRequestException('Header de autorización faltante');
    }
    // Extraer el token si viene con 'Refresh '
    const token = refreshToken.replace('Refresh ', '');
    const datos = await this.refreshTokenUseCase.ejecutar(token);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Renovación de tokens exitosa', datos);
  }
}
