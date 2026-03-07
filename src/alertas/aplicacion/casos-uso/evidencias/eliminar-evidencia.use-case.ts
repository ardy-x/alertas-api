import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { EvidenciaRepositorioPort } from '@/alertas/dominio/puertos/evidencia.port';
import { EVIDENCIA_REPOSITORIO_TOKEN } from '@/alertas/dominio/tokens/alerta.tokens';

@Injectable()
export class EliminarEvidenciaUseCase {
  private readonly logger = new Logger(EliminarEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORIO_TOKEN)
    private readonly evidenciaRepo: EvidenciaRepositorioPort,
  ) {}

  async ejecutar(idEvidencia: string): Promise<void> {
    try {
      await this.evidenciaRepo.eliminarEvidencia(idEvidencia);
      this.logger.log(`Evidencia ${idEvidencia} eliminada`);
    } catch {
      throw new NotFoundException('Evidencia no encontrada');
    }
  }
}
