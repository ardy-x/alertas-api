import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { AlertaRepositorioPort } from '@/alertas/dominio/puertos/alerta.port';
import { EvidenciaRepositorioPort } from '@/alertas/dominio/puertos/evidencia.port';
import { ALERTA_REPOSITORIO_TOKEN, EVIDENCIA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';
import { ListarEvidenciasResponseDto } from '@/alertas/presentacion/dto/salida/evidencias-salida.dto';

@Injectable()
export class ListarEvidenciasUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORIO_TOKEN)
    private readonly evidenciaRepo: EvidenciaRepositorioPort,
    @Inject(ALERTA_REPOSITORIO_TOKEN)
    private readonly alertaRepo: AlertaRepositorioPort,
  ) {}

  async ejecutar(idAlerta: string): Promise<ListarEvidenciasResponseDto> {
    // 1. Validar que la alerta existe
    const alerta = await this.alertaRepo.obtenerAlertaSimple(idAlerta);
    if (!alerta) {
      throw new NotFoundException('Alerta no encontrada');
    }

    // 2. Obtener evidencias
    const evidencias = await this.evidenciaRepo.obtenerPorAlerta(idAlerta);

    return {
      evidencias: evidencias.map((ev) => ({
        id: ev.id,
        idAlerta: ev.idAlerta,
        tipoEvidencia: ev.tipoEvidencia,
        rutaArchivo: ev.rutaArchivo,
        creadoEn: ev.creadoEn!,
      })),
      total: evidencias.length,
    };
  }
}
