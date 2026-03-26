import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ClaveApiGuard } from '@/victimas/infraestructura/guards/clave-api.guard';
import { ObtenerUnidadesCercanasUseCase } from '../../aplicacion/casos-uso/obtener-unidades-cercanas.use-case';
import { EncontrarDepartamentoQueryDto } from '../dto/encontrar-departamento-query.dto';
import { UnidadDto } from '../dto/unidad.dto';

@ApiTags('UNIDADES')
@ApiSecurity('api-key')
@ApiRespuestasComunes()
@Controller('unidades')
@UseGuards(ClaveApiGuard)
export class UnidadesController {
  constructor(private readonly obtenerUnidadesCercanasUseCase: ObtenerUnidadesCercanasUseCase) {}

  @ApiOperation({ summary: 'Obtener las 5 unidades más cercanas a una ubicación' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Unidades cercanas obtenidas exitosamente', type: [UnidadDto] })
  @Get('cercanas')
  async obtenerUnidadesCercanas(@Query() query: EncontrarDepartamentoQueryDto) {
    const unidades = await this.obtenerUnidadesCercanasUseCase.ejecutar({ latitud: query.latitud, longitud: query.longitud });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Unidades cercanas obtenidas exitosamente', unidades);
  }
}
