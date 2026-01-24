import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { VerificarDenunciaUseCase } from '../../aplicacion/casos-uso/verificar-denuncia.use-case';
import { VerificarDenunciaRequestDto } from '../dto/entrada/verificar-denuncia.dto';
import { VictimaDto } from '../dto/salida/verificar-denuncia.dto';

@ApiTags('VÍCTIMAS')
@Controller('victimas')
export class VerificarDenunciaController {
  constructor(private readonly verificarDenunciaUseCase: VerificarDenunciaUseCase) {}

  @Get('/verificar-denuncia')
  @ApiOperation({ summary: 'Verificar denuncia' })
  async verificarDenuncia(@Query() request: VerificarDenunciaRequestDto): Promise<RespuestaBaseDto<{ victima?: VictimaDto }>> {
    const victima = await this.verificarDenunciaUseCase.ejecutar(request.codigoDenuncia, request.cedulaIdentidad);

    if (!victima) {
      return RespuestaBuilder.exito(HttpStatus.OK, 'No se encontró ninguna denuncia con el código proporcionado');
    }

    return RespuestaBuilder.exito(HttpStatus.OK, 'Denuncia verificada exitosamente', { victima });
  }
}
