import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { ActualizarUbicacionRequestDto } from '../../presentacion/dto/entrada/victima.dto';

@Injectable()
export class ActualizarUbicacionUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, entrada: ActualizarUbicacionRequestDto): Promise<void> {
    const victima = await this.victimaRepositorio.obtenerVictimaSimple(idVictima);
    if (!victima) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Preparar datos de actualización
    const datosActualizacion = {
      direccionDomicilio: entrada.direccionDomicilio,
      puntoReferencia: entrada.puntoReferencia,
      idMunicipio: entrada.idMunicipio,
    };

    await this.victimaRepositorio.actualizarUbicacion(idVictima, datosActualizacion);
  }
}
