import { BadRequestException, Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { Public } from '@/autenticacion/infraestructura/decoradores/public.decorator';
import { KerberosJwtAuthGuard } from '@/autenticacion/infraestructura/guards/kerberos-jwt-auth.guard';

import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { ObtenerUnidadesCercanasUseCase } from '../../aplicacion/casos-uso/obtener-unidades-cercanas.use-case';

@ApiTags('UNIDADES')
@Controller('unidades')
@UseGuards(KerberosJwtAuthGuard)
export class UnidadesController {
  constructor(private readonly obtenerUnidadesCercanasUseCase: ObtenerUnidadesCercanasUseCase) {}

  @ApiQuery({ name: 'latitud', example: '-16.5000' })
  @ApiQuery({ name: 'longitud', example: '-68.1501' })
  @Public()
  @Get('cercanas')
  async obtenerUnidadesCercanas(@Query('latitud') latitud: string, @Query('longitud') longitud: string) {
    const lat = parseFloat(latitud);
    const lon = parseFloat(longitud);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      throw new BadRequestException('Latitud y longitud deben ser números válidos');
    }
    const unidades = await this.obtenerUnidadesCercanasUseCase.ejecutar({ latitud: lat, longitud: lon });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Unidades cercanas obtenidas exitosamente', unidades);
  }
}
