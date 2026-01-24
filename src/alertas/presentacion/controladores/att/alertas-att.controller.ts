import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { crearAlertaAttUseCase } from '@/alertas/aplicacion/casos-uso/att/crear-alerta-att.use-case';
import { RespuestaBaseDto } from '@/core/dto/respuesta-base.dto';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { RecibirDatosAttDto } from '../../dto/entrada/datos-att-entrada.dto';

@ApiTags('ALERTAS ATT')
@Controller('alertas/att')
export class AlertasAttController {
  constructor(private readonly recibirDatosAttUseCase: crearAlertaAttUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva alerta con datos externos de ATT' })
  async crearAlertaConDatosExternos(@Body() datos: RecibirDatosAttDto): Promise<RespuestaBaseDto<unknown>> {
    const alertaCreada = await this.recibirDatosAttUseCase.ejecutar(datos);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Alerta de ATT creada exitosamente', {
      idAlerta: alertaCreada.id,
      estado: 'PENDIENTE',
    });
  }
}
