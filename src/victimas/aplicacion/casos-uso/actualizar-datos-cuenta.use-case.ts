import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { VictimaRepositorioPort } from '@/victimas/dominio/puertos/victima.port';
import { VICTIMA_REPOSITORIO } from '@/victimas/dominio/tokens/victima.tokens';

import { ActualizarDatosCuentaRequestDto } from '../../presentacion/dto/entrada/victima.dto';

@Injectable()
export class ActualizarDatosCuentaUseCase {
  constructor(
    @Inject(VICTIMA_REPOSITORIO)
    private readonly victimaRepositorio: VictimaRepositorioPort,
  ) {}

  async ejecutar(idVictima: string, entrada: ActualizarDatosCuentaRequestDto): Promise<void> {
    const victimaExistente = await this.victimaRepositorio.obtenerVictimaConDispositivo(idVictima);
    if (!victimaExistente) {
      throw new NotFoundException('Víctima no encontrada');
    }

    // Preparar datos de actualización (solo idDispositivo, fcmToken e infoDispositivo)
    const datosActualizacion = {
      idDispositivo: entrada.idDispositivo?.trim(),
      fcmToken: entrada.fcmToken?.trim(),
      infoDispositivo: entrada.infoDispositivo,
    };

    await this.victimaRepositorio.actualizarDatosCuenta(idVictima, datosActualizacion);
  }
}
