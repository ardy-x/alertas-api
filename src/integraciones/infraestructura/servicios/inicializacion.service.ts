import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { BACKUP_CONFIG, REDIS_CONFIG } from '@/config/redis.config';
import { CachearDepartamentosUseCase } from '../../aplicacion/casos-uso/cachear-departamentos.use-case';
import { CachearMunicipiosGeoServerUseCase } from '../../aplicacion/casos-uso/cachear-geo-server.use-case';
import { BackupService } from './backup.service';

@Injectable()
export class InicializacionService {
  private readonly logger = new Logger(InicializacionService.name);

  constructor(
    private readonly precargarMunicipiosGeoServerUseCase: CachearMunicipiosGeoServerUseCase,
    private readonly precargarDepartamentosUseCase: CachearDepartamentosUseCase,
    private readonly backupService: BackupService,
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

  @Cron(BACKUP_CONFIG.cronSchedule)
  async realizarBackupDiario() {
    try {
      this.logger.log('Iniciando backup diario de la base de datos...');
      await this.backupService.ejecutarBackup();
      this.logger.log('Backup diario completado exitosamente');
    } catch (error) {
      this.logger.error(`Error en backup diario: ${(error as Error).message}`);
    }
  }
}
