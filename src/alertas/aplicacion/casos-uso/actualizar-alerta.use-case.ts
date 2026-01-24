import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { ALERTA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { convertirAUbicacionGeoJSON } from '@/utils/ubicacion.utils';

import { ActualizarAlertaRequestDto } from '../../presentacion/dto/entrada/alertas-entrada.dto';

@Injectable()
export class ActualizarAlertaUseCase {
  constructor(
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepositorio: AlertaRepositorioPort,
  ) {}

  async ejecutar(idAlerta: string, actualizarAlertaDto: ActualizarAlertaRequestDto): Promise<void> {
    // Validar que la alerta existe
    const alertaExistente = await this.alertaRepositorio.obtenerAlertaSimple(idAlerta);
    if (!alertaExistente) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // Solo actualizar la ubicación - convertir a GeoJSON en el caso de uso
    const ubicacionGeoJSON = convertirAUbicacionGeoJSON(actualizarAlertaDto.ubicacion);
    await this.alertaRepositorio.actualizarUbicacion(idAlerta, ubicacionGeoJSON);
  }
}
