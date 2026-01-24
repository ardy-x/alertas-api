import { Body, Controller, Delete, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';

import { ActualizarContactoEmergenciaUseCase } from '../../aplicacion/casos-uso/actualizar-contacto-emergencia.use-case';
import { AgregarContactoVictimaUseCase } from '../../aplicacion/casos-uso/agregar-contacto-victima.use-case';
import { EliminarContactoEmergenciaUseCase } from '../../aplicacion/casos-uso/eliminar-contacto-emergencia.use-case';
import { MarcarContactoPrincipalUseCase } from '../../aplicacion/casos-uso/marcar-contacto-principal.use-case';
import { ClaveApiGuard } from '../../infraestructura/guards/clave-api.guard';
import { ActualizarContactoEmergenciaDto, ContactoEmergenciaDto } from '../dto/entrada/contactos-victima.dto';

@ApiTags('CONTACTOS DE EMERGENCIA')
@Controller('victimas/:idVictima/contactos')
@UseGuards(ClaveApiGuard)
export class ContactosEmergenciaController {
  constructor(
    private readonly agregarContactoVictimaUseCase: AgregarContactoVictimaUseCase,
    private readonly actualizarContactoEmergenciaUseCase: ActualizarContactoEmergenciaUseCase,
    private readonly eliminarContactoEmergenciaUseCase: EliminarContactoEmergenciaUseCase,
    private readonly marcarContactoPrincipalUseCase: MarcarContactoPrincipalUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Agregar contacto de emergencia a una víctima' })
  @ApiBody({ type: ContactoEmergenciaDto })
  async agregarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() contactoData: ContactoEmergenciaDto) {
    await this.agregarContactoVictimaUseCase.ejecutar(idVictima, contactoData);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Contacto agregado exitosamente');
  }

  @Patch(':idContacto')
  @ApiOperation({ summary: 'Actualizar contacto de emergencia de una víctima' })
  @ApiBody({ type: ActualizarContactoEmergenciaDto })
  async actualizarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string, @Body() datosActualizacion: ActualizarContactoEmergenciaDto) {
    await this.actualizarContactoEmergenciaUseCase.ejecutar({ idVictima, idContacto }, datosActualizacion);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto actualizado exitosamente');
  }

  @Delete(':idContacto')
  @ApiOperation({ summary: 'Eliminar contacto de emergencia de una víctima' })
  async eliminarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string) {
    await this.eliminarContactoEmergenciaUseCase.ejecutar({ idVictima, idContacto });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto eliminado exitosamente');
  }

  @Patch(':idContacto/principal')
  @ApiOperation({ summary: 'Marcar contacto de emergencia como principal' })
  async marcarComoPrincipal(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string) {
    await this.marcarContactoPrincipalUseCase.ejecutar({ idVictima, idContacto });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto marcado como principal exitosamente');
  }
}
