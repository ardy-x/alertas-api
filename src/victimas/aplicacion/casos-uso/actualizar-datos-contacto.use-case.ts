import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActualizarDatosContacto, VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VictimaValidacionDominioService } from '@/victimas/dominio/servicios/victima-validacion-dominio.service';
import { VICTIMA_REPOSITORIO, VICTIMA_VALIDACION_DOMINIO_SERVICE } from '@/victimas/dominio/tokens/victima.tokens';

import { ActualizarDatosContactoRequestDto } from '../../presentacion/dto/entrada/victima.dto';

@Injectable()
export class ActualizarDatosContactoUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
    @Inject(VICTIMA_VALIDACION_DOMINIO_SERVICE)
    private readonly victimaValidacionDominio: VictimaValidacionDominioService,
  ) {}

  async ejecutar(idVictima: string, entrada: ActualizarDatosContactoRequestDto): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    if (entrada.celular && entrada.celular.trim() !== victima.celular) {
      await this.victimaValidacionDominio.validarActualizacion(idVictima, victima.cedulaIdentidad, entrada.celular.trim());
    }

    // Preparar datos de actualización (solo celular y correo)
    const datosActualizacion: ActualizarDatosContacto = {};
    if (entrada.celular !== undefined) {
      datosActualizacion.celular = entrada.celular.trim();
    }
    if (entrada.correo !== undefined) {
      datosActualizacion.correo = entrada.correo && entrada.correo.trim() !== '' ? entrada.correo.trim() : undefined;
    }

    await this.victimaRepositorio.actualizarDatosContacto(idVictima, datosActualizacion);
  }
}
