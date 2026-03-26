import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { ActualizarContactoEmergencia, ContactoEmergenciaRepositorioPort } from '@/victimas/dominio/puertos/contacto-emergencia.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CONTACTO_EMERGENCIA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { ActualizarContactoEmergenciaDto } from '../../../presentacion/dto/entrada/contactos-victima.dto';

@Injectable()
export class ActualizarContactoEmergenciaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CONTACTO_EMERGENCIA_REPOSITORIO)
    private readonly contactoEmergenciaRepositorio: ContactoEmergenciaRepositorioPort,
  ) {}

  async ejecutar({ idVictima, idContacto }: { idVictima: string; idContacto: string }, entrada: ActualizarContactoEmergenciaDto): Promise<void> {
    // Verificar que al menos un campo se va a actualizar
    if (!entrada.nombreCompleto && !entrada.celular && !entrada.parentesco) {
      throw new Error('Al menos un campo debe ser proporcionado para actualizar');
    }

    // Verificar que la víctima existe
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Verificar que el contacto existe y pertenece a la víctima
    const contactoActual = await this.contactoEmergenciaRepositorio.obtenerContactoEmergencia(idContacto);
    if (!contactoActual) {
      throw new NotFoundException('Contacto no encontrado');
    }

    if (contactoActual.idVictima !== idVictima) {
      throw new Error('El contacto no pertenece a esta víctima');
    }

    // Preparar datos de actualización
    const datosActualizacion: ActualizarContactoEmergencia = {};
    if (entrada.nombreCompleto !== undefined && entrada.nombreCompleto.trim() !== '') {
      datosActualizacion.nombreCompleto = entrada.nombreCompleto.trim();
    }
    if (entrada.celular !== undefined && entrada.celular.trim() !== '') {
      datosActualizacion.celular = entrada.celular.trim();
    }
    if (entrada.parentesco !== undefined && entrada.parentesco.trim() !== '') {
      datosActualizacion.parentesco = entrada.parentesco.trim();
    }

    // Verificar que hay datos para actualizar
    if (Object.keys(datosActualizacion).length === 0) {
      throw new Error('No hay datos válidos para actualizar');
    }

    // Actualizar el contacto
    await this.contactoEmergenciaRepositorio.actualizarContacto(idContacto, datosActualizacion);
  }
}
