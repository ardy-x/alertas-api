import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { REDIS_CONFIG } from '@/config/redis.config';
import { CachearDepartamentosUseCase } from '../../aplicacion/casos-uso/cachear-departamentos.use-case';
import { CachearMunicipiosGeoServerUseCase } from '../../aplicacion/casos-uso/cachear-geo-server.use-case';

@Injectable()
export class InicializacionService {
  private readonly logger = new Logger(InicializacionService.name);

  constructor(
    private readonly precargarMunicipiosGeoServerUseCase: CachearMunicipiosGeoServerUseCase,
    private readonly precargarDepartamentosUseCase: CachearDepartamentosUseCase,
  ) {}

  @Cron(REDIS_CONFIG.cronSchedule)
  async cachearDatosDiarios() {
    try {
      await this.precargarMunicipiosGeoServerUseCase.ejecutar();
      await this.precargarDepartamentosUseCase.ejecutar();
    } catch (error) {
      this.logger.error(`Error en cacheo programado: ${(error as Error).message}`);
    }
  }
}
