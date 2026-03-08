import { Body, Controller, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { LogDatosInterceptor } from '@/core/interceptores/log-datos.interceptor';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ClaveApiGuard } from '@/victimas/infraestructura/guards/clave-api.guard';
import { CrearPuntoRutaUseCase } from '../../aplicacion/casos-uso/crear-punto-ruta.use-case';
import { CrearPuntoRutaRequestDto } from '../dto/entrada/ruta-alerta-entrada.dto';
@ApiTags('RUTA ALERTA')
@Controller('ruta-alerta')
@ApiRespuestasComunes()
@ApiSecurity('api-key')
@UseGuards(ClaveApiGuard)
@UseInterceptors(LogDatosInterceptor)
export class RutaAlertaController {
  constructor(private readonly crearPuntoRutaUseCase: CrearPuntoRutaUseCase) {}

  @Post('punto')
  @ApiOperation({ summary: 'Agregar punto a ruta de alerta' })
  @ApiBody({ type: CrearPuntoRutaRequestDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Ruta de alerta creada con primer punto exitosamente' })
  async agregarPunto(@Body() crearPuntoRutaDto: CrearPuntoRutaRequestDto): Promise<RespuestaBaseDto<void>> {
    const resultado = await this.crearPuntoRutaUseCase.ejecutar(crearPuntoRutaDto);
    const codigoEstado = resultado.rutaCreada ? HttpStatus.CREATED : HttpStatus.OK;
    const mensaje = resultado.rutaCreada ? 'Ruta de alerta creada con primer punto exitosamente' : 'Punto agregado a ruta existente exitosamente';
    return RespuestaBuilder.exito(codigoEstado, mensaje);
  }
}
