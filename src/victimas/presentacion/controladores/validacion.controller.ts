import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { SolicitarCodigoEmailUseCase } from '@/victimas/aplicacion/casos-uso/validacion/solicitar-codigo-email.use-case';
import { SolicitarCodigoWhatsappUseCase } from '@/victimas/aplicacion/casos-uso/validacion/solicitar-codigo-whatsapp.use-case';
import { VerificarCodigoCelularUseCase } from '@/victimas/aplicacion/casos-uso/validacion/verificar-codigo-celular.use-case';
import { VerificarCodigoEmailUseCase } from '@/victimas/aplicacion/casos-uso/validacion/verificar-codigo-email.use-case';

import { VerificarCodigoCelularRequestDto } from '../dto/entrada/validacion/codigo-verificacion-celular-request.dto';
import { VerificarCodigoEmailRequestDto } from '../dto/entrada/validacion/codigo-verificacion-email-request.dto';
import { SolicitarCodigoEmailRequestDto } from '../dto/entrada/validacion/solicitar-codigo-email-request.dto';
import { SolicitarCodigoWhatsappRequestDto } from '../dto/entrada/validacion/solicitar-codigo-whatsapp-request.dto';
import { VerificarCodigoResponseDto } from '../dto/salida/verificar-codigo-response.dto';

@ApiTags('CÓDIGOS DE VERIFICACIÓN')
@Controller('codigos')
export class ValidacionController {
  constructor(
    private readonly solicitarCodigoWhatsappUseCase: SolicitarCodigoWhatsappUseCase,
    private readonly solicitarCodigoEmailUseCase: SolicitarCodigoEmailUseCase,
    private readonly verificarCodigoCelularUseCase: VerificarCodigoCelularUseCase,
    private readonly verificarCodigoEmailUseCase: VerificarCodigoEmailUseCase,
  ) {}

  @Post('solicitar-codigo-whatsapp')
  @ApiOperation({ summary: 'Solicitar código de verificación por WhatsApp' })
  @ApiBody({ type: SolicitarCodigoWhatsappRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código enviado exitosamente por WhatsApp' })
  async solicitarCodigoWhatsapp(@Body() solicitarCodigoDto: SolicitarCodigoWhatsappRequestDto) {
    await this.solicitarCodigoWhatsappUseCase.ejecutar(solicitarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código enviado exitosamente por WhatsApp');
  }

  @Post('solicitar-codigo-email')
  @ApiOperation({ summary: 'Solicitar código de verificación por email' })
  @ApiBody({ type: SolicitarCodigoEmailRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código enviado exitosamente por email' })
  async solicitarCodigoEmail(@Body() solicitarCodigoDto: SolicitarCodigoEmailRequestDto) {
    await this.solicitarCodigoEmailUseCase.ejecutar(solicitarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código enviado exitosamente por email');
  }

  @Post('verificar-codigo-celular')
  @ApiOperation({ summary: 'Verificar código por celular y obtener API key' })
  @ApiBody({ type: VerificarCodigoCelularRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código verificado exitosamente', type: VerificarCodigoResponseDto })
  async verificarCodigoCelular(@Body() verificarCodigoDto: VerificarCodigoCelularRequestDto): Promise<RespuestaBaseDto<VerificarCodigoResponseDto>> {
    const resultado = await this.verificarCodigoCelularUseCase.ejecutar(verificarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código verificado exitosamente', resultado);
  }

  @Post('verificar-codigo-email')
  @ApiOperation({ summary: 'Verificar código por email y obtener API key' })
  @ApiBody({ type: VerificarCodigoEmailRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código verificado exitosamente', type: VerificarCodigoResponseDto })
  async verificarCodigoEmail(@Body() verificarCodigoDto: VerificarCodigoEmailRequestDto): Promise<RespuestaBaseDto<VerificarCodigoResponseDto>> {
    const resultado = await this.verificarCodigoEmailUseCase.ejecutar(verificarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código verificado exitosamente', resultado);
  }
}
