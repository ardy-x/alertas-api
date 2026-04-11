import { Body, Controller, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { LogDatosInterceptor } from '@/core/interceptores/log-datos.interceptor';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { SolicitarCodigoUseCase } from '@/victimas/aplicacion/casos-uso/validacion/solicitar-codigo.use-case';
import { VerificarCodigoUseCase } from '@/victimas/aplicacion/casos-uso/validacion/verificar-codigo.use-case';
import { SolicitarCodigoRequestDto } from '../dto/entrada/validacion/solicitar-codigo-request.dto';
import { VerificarCodigoRequestDto } from '../dto/entrada/validacion/verificar-codigo-request.dto';
import { SolicitarCodigoResponseDto } from '../dto/salida/solicitar-codigo-response.dto';
import { VerificarCodigoResponseDto } from '../dto/salida/verificar-codigo-response.dto';

@ApiTags('CÓDIGOS DE VERIFICACIÓN')
@Controller('codigos')
@ApiRespuestasComunes()
@UseInterceptors(LogDatosInterceptor)
export class ValidacionController {
  constructor(
    private readonly solicitarCodigoUseCase: SolicitarCodigoUseCase,
    private readonly verificarCodigoUseCase: VerificarCodigoUseCase,
  ) {}

  @Post('solicitar-codigo')
  @ApiOperation({ summary: 'Solicitar código de verificación por canal' })
  @ApiBody({ type: SolicitarCodigoRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código enviado exitosamente', type: SolicitarCodigoResponseDto })
  async solicitarCodigo(@Body() solicitarCodigoDto: SolicitarCodigoRequestDto): Promise<RespuestaBaseDto<SolicitarCodigoResponseDto>> {
    const resultado = await this.solicitarCodigoUseCase.ejecutar(solicitarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código enviado exitosamente', resultado);
  }

  @Post('verificar-codigo')
  @ApiOperation({ summary: 'Verificar código y obtener API key' })
  @ApiBody({ type: VerificarCodigoRequestDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Código verificado exitosamente', type: VerificarCodigoResponseDto })
  async verificarCodigo(@Body() verificarCodigoDto: VerificarCodigoRequestDto): Promise<RespuestaBaseDto<VerificarCodigoResponseDto>> {
    const resultado = await this.verificarCodigoUseCase.ejecutar(verificarCodigoDto);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Código verificado exitosamente', resultado);
  }
}
