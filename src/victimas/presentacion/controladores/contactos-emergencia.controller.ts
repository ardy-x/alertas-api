import { Body, Controller, Delete, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ApiRespuestasComunes } from '@/core/decoradores/api-respuestas-comunes.decorator';
import { RespuestaBuilder } from '@/core/utilidades/respuesta.builder';
import { AgregarContactoVictimaUseCase } from '@/victimas/aplicacion/casos-uso/contactos-emergencia/agregar-contacto-victima.use-case';
import { ActualizarContactoEmergenciaUseCase } from '../../aplicacion/casos-uso/contactos-emergencia/actualizar-contacto-emergencia.use-case';
import { EliminarContactoEmergenciaUseCase } from '../../aplicacion/casos-uso/contactos-emergencia/eliminar-contacto-emergencia.use-case';
import { MarcarContactoPrincipalUseCase } from '../../aplicacion/casos-uso/contactos-emergencia/marcar-contacto-principal.use-case';
import { ClaveApiGuard } from '../../infraestructura/guards/clave-api.guard';
import { ActualizarContactoEmergenciaDto, ContactoEmergenciaDto } from '../dto/entrada/contactos-victima.dto';

@ApiTags('CONTACTOS DE EMERGENCIA')
@ApiSecurity('api-key')
@ApiRespuestasComunes()
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
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contacto agregado exitosamente' })
  async agregarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Body() contactoData: ContactoEmergenciaDto) {
    await this.agregarContactoVictimaUseCase.ejecutar(idVictima, contactoData);
    return RespuestaBuilder.exito(HttpStatus.CREATED, 'Contacto agregado exitosamente');
  }

  @Patch(':idContacto')
  @ApiOperation({ summary: 'Actualizar contacto de emergencia de una víctima' })
  @ApiBody({ type: ActualizarContactoEmergenciaDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contacto actualizado exitosamente' })
  async actualizarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string, @Body() datosActualizacion: ActualizarContactoEmergenciaDto) {
    await this.actualizarContactoEmergenciaUseCase.ejecutar({ idVictima, idContacto }, datosActualizacion);
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto actualizado exitosamente');
  }

  @Delete(':idContacto')
  @ApiOperation({ summary: 'Eliminar contacto de emergencia de una víctima' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contacto eliminado exitosamente' })
  async eliminarContacto(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string) {
    await this.eliminarContactoEmergenciaUseCase.ejecutar({ idVictima, idContacto });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto eliminado exitosamente');
  }

  @Patch(':idContacto/principal')
  @ApiOperation({ summary: 'Marcar contacto de emergencia como principal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contacto marcado como principal exitosamente' })
  async marcarComoPrincipal(@Param('idVictima', ParseUUIDPipe) idVictima: string, @Param('idContacto', ParseUUIDPipe) idContacto: string) {
    await this.marcarContactoPrincipalUseCase.ejecutar({ idVictima, idContacto });
    return RespuestaBuilder.exito(HttpStatus.OK, 'Contacto marcado como principal exitosamente');
  }
}
