import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';

import { TextoUtilidades } from '@/utils/texto-utilidades.util';
import { ContactoEmergenciaRepositorioPort } from '@/victimas/dominio/puertos/contacto-emergencia.port';
import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { CONTACTO_EMERGENCIA_REPOSITORIO, VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';
import { ContactoEmergenciaDto } from '../../presentacion/dto/entrada/contactos-victima.dto';

@Injectable()
export class AgregarContactoVictimaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(CONTACTO_EMERGENCIA_REPOSITORIO)
    private readonly contactoEmergenciaRepositorio: ContactoEmergenciaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, entrada: ContactoEmergenciaDto): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Verificar límite de 5 contactos
    const contactosExistentes = await this.contactoEmergenciaRepositorio.obtenerContactosPorVictima(idVictima);
    if (contactosExistentes.length >= 5) {
      throw new Error('Máximo 5 contactos de emergencia permitidos');
    }

    // Si se está marcando como principal, verificar que no haya otro contacto principal
    if (entrada.principal === true) {
      const contactoPrincipalExistente = contactosExistentes.find((contacto) => contacto.principal === true);
      if (contactoPrincipalExistente) {
        throw new Error('Ya existe un contacto principal para esta víctima. Solo puede haber un contacto principal.');
      }
    }

    // Crear nuevo contacto vinculado directamente a la víctima
    await this.contactoEmergenciaRepositorio.crearContacto({
      id: uuidv4(),
      idVictima: idVictima,
      nombreCompleto: TextoUtilidades.formatearNombreCompleto(entrada.nombreCompleto),
      celular: entrada.celular.trim(),
      parentesco: TextoUtilidades.formatearNombreCompleto(entrada.parentesco),
      principal: entrada.principal,
    });
  }
}
