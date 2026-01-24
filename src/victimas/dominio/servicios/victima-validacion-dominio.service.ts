import { Inject, Injectable } from '@nestjs/common';

import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

/**
 * Servicio de dominio para validaciones de reglas de negocio de víctimas
 */
@Injectable()
export class VictimaValidacionDominioService {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  /**
   * Valida reglas de negocio para contactos de emergencia
   */
  private validarContactos(celularVictima: string, contactosEmergencia: { celular: string }[]): void {
    const contactosConMismoCelular = contactosEmergencia.filter((c) => c.celular.trim() === celularVictima);
    if (contactosConMismoCelular.length > 0) {
      throw new Error('El celular de la víctima no puede ser el mismo que el de un contacto de emergencia');
    }
    const celularesContactos = contactosEmergencia.map((c) => c.celular.trim());
    const celularesUnicos = new Set(celularesContactos);
    if (celularesUnicos.size !== celularesContactos.length) {
      throw new Error('Los celulares de los contactos de emergencia deben ser únicos');
    }
  }

  /**
   * Valida reglas de negocio para creación de víctima
   */
  async validarCreacion(cedulaIdentidad: string, celular: string, contactosEmergencia?: { celular: string }[]): Promise<void> {
    const victimaExistenteCedula = await this.victimaRepositorio.obtenerPorCedula(cedulaIdentidad);
    if (victimaExistenteCedula) {
      throw new Error('Ya existe una víctima registrada con esta cédula de identidad');
    }
    const victimaExistenteCelular = await this.victimaRepositorio.obtenerPorCelular(celular);
    if (victimaExistenteCelular) {
      throw new Error('Ya existe una víctima registrada con este número de celular');
    }

    if (contactosEmergencia) {
      this.validarContactos(celular, contactosEmergencia);
    }
  }

  /**
   * Valida reglas de negocio para actualización de víctima
   */
  async validarActualizacion(idVictima: string, cedulaIdentidad?: string, celular?: string, contactosEmergencia?: { celular: string }[]): Promise<void> {
    if (cedulaIdentidad) {
      const victimaExistenteCedula = await this.victimaRepositorio.obtenerPorCedula(cedulaIdentidad);
      if (victimaExistenteCedula && victimaExistenteCedula.id !== idVictima) {
        throw new Error('Ya existe otra víctima registrada con esta cédula de identidad');
      }
    }

    if (celular) {
      const victimaExistenteCelular = await this.victimaRepositorio.obtenerPorCelular(celular);
      if (victimaExistenteCelular && victimaExistenteCelular.id !== idVictima) {
        throw new Error('Ya existe otra víctima registrada con este número de celular');
      }
    }

    if (contactosEmergencia && celular) {
      this.validarContactos(celular, contactosEmergencia);
    }
  }

  /**
   * Valida reglas de negocio para fechas
   */
  validarFechaNacimiento(fechaNacimiento: Date): void {
    const hoy = new Date();
    if (fechaNacimiento >= hoy) {
      throw new Error('La fecha de nacimiento debe ser anterior a la fecha actual');
    }
    if (fechaNacimiento.getFullYear() < 1900) {
      throw new Error('La fecha de nacimiento no puede ser anterior al año 1900');
    }
  }
}
