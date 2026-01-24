import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { CrearPuntoRutaUseCase } from '../../aplicacion/casos-uso/crear-punto-ruta.use-case';
import { CrearPuntoRutaRequestDto } from '../dto/entrada/ruta-alerta-entrada.dto';
@ApiTags('RUTA ALERTA')
@Controller('ruta-alerta')
export class RutaAlertaController {
  constructor(private readonly crearPuntoRutaUseCase: CrearPuntoRutaUseCase) {}

  @Post('punto')
  @ApiOperation({ summary: 'Agregar punto a ruta de alerta' })
  @ApiBody({ type: CrearPuntoRutaRequestDto })
  async agregarPunto(@Body() crearPuntoRutaDto: CrearPuntoRutaRequestDto): Promise<RespuestaBaseDto<void>> {
    const resultado = await this.crearPuntoRutaUseCase.ejecutar(crearPuntoRutaDto);
    const codigoEstado = resultado.rutaCreada ? HttpStatus.CREATED : HttpStatus.OK;
    const mensaje = resultado.rutaCreada ? 'Ruta de alerta creada con primer punto exitosamente' : 'Punto agregado a ruta existente exitosamente';
    return RespuestaBuilder.exito(codigoEstado, mensaje);
  }
}
