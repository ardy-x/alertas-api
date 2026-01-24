import { BadRequestException, Body, Controller, Get, Headers, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { CierreSesionSistemaUseCase } from '../../aplicacion/casos-uso/cierre-sesion-sistema.use-case';
import { DecodificarTokenUseCase } from '../../aplicacion/casos-uso/decodificar-token.use-case';
import { RefreshTokenUseCase } from '../../aplicacion/casos-uso/refresh-token.use-case';
import { CierreSesionSistemaRequestDto } from '../dtos/entrada/cierre-sesion-sistema-request.dto';
import { DecodificarTokenRequestDto } from '../dtos/entrada/decodificar-token-request.dto';
import { DecodificarTokenDatosDto } from '../dtos/salida/decodificar-token-response.dto';
import { RefreshTokenResponseDto } from '../dtos/salida/refresh-token-response.dto';

@ApiTags('AUTENTICACIÓN')
@Controller('autenticacion')
export class AutenticacionController {
  constructor(
    private readonly decodificarTokenUseCase: DecodificarTokenUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly cierreSesionSistemaUseCase: CierreSesionSistemaUseCase,
  ) {}

  @Post('intercambio-codigo')
  @ApiOperation({ summary: 'Decodificar token JWT' })
  @ApiBody({ type: DecodificarTokenRequestDto })
  async decodificarToken(@Body() request: DecodificarTokenRequestDto): Promise<RespuestaBaseDto<DecodificarTokenDatosDto>> {
    const resultado = await this.decodificarTokenUseCase.ejecutar(request);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Token decodificado exitosamente', resultado);
  }

  @Post('cierre-sesion-sistema')
  @UseGuards(KerberosJwtAuthGuard)
  @ApiOperation({ summary: 'Termina la sesión del usuario en el sistema' })
  async cierreSesionSistema(@Body() dto: CierreSesionSistemaRequestDto, @Headers('authorization') authHeader: string): Promise<RespuestaBaseDto<void>> {
    const accessToken = authHeader.replace('Bearer ', '');
    await this.cierreSesionSistemaUseCase.ejecutar(dto.idSistema, accessToken);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Cierre de sesión del sistema completado exitosamente');
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Renovar tokens' })
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
