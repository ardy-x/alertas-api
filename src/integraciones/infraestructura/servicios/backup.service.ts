import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { DATABASE_CONFIG } from '@/config/database.config';
import { BACKUP_CONFIG } from '@/config/redis.config';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  async ejecutarBackup(): Promise<void> {
    try {
      // Asegurar que el directorio de backups existe
      await mkdir(BACKUP_CONFIG.backupDir, { recursive: true });

      // Extraer nombre de la base de datos
      const nombreBD = this.extraerNombreBaseDatos(DATABASE_CONFIG.url);

      // Generar nombre del archivo con fecha actual
      const fecha = new Date();
      const nombreArchivo = `${nombreBD}-backup-${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}.sql`;
      const rutaCompleta = path.join(BACKUP_CONFIG.backupDir, nombreArchivo);

      // Ejecutar backup de PostgreSQL
      await this.backupPostgres(rutaCompleta);

      this.logger.log(`Backup creado exitosamente: ${nombreArchivo}`);

      // Limpiar backups antiguos
      await this.limpiarBackupsAntiguos();
    } catch (error) {
      this.logger.error(`Error en backup: ${(error as Error).message}`);
      throw error;
    }
  }

  private async backupPostgres(rutaCompleta: string): Promise<void> {
    const url = DATABASE_CONFIG.url;
    const password = this.extraerPassword(url);
    const connectionString = this.extraerConnectionString(url);

    const comando = `PGPASSWORD="${password}" pg_dump "${connectionString}" > "${rutaCompleta}"`;

    try {
      await execAsync(comando);
    } catch (error) {
      throw new Error(`Error ejecutando pg_dump: ${(error as Error).message}`);
    }
  }

  private async limpiarBackupsAntiguos(): Promise<void> {
    try {
      const archivos = await readdir(BACKUP_CONFIG.backupDir);
      const nombreBD = this.extraerNombreBaseDatos(DATABASE_CONFIG.url);
      const backups = archivos.filter((archivo) => archivo.includes('-backup-') && archivo.endsWith('.sql') && archivo.startsWith(nombreBD));

      const backupsConFecha = await Promise.all(
        backups.map(async (archivo) => ({
          nombre: archivo,
          ruta: path.join(BACKUP_CONFIG.backupDir, archivo),
          stats: await stat(path.join(BACKUP_CONFIG.backupDir, archivo)),
        })),
      );

      // Ordenar por fecha de modificación (más nuevo primero)
      backupsConFecha.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Calcular fecha límite
      const ahora = new Date();
      const fechaLimite = new Date(ahora.getTime() - BACKUP_CONFIG.retentionDays * 24 * 60 * 60 * 1000);

      // Eliminar backups más antiguos
      for (const backup of backupsConFecha) {
        if (backup.stats.mtime < fechaLimite) {
          await unlink(backup.ruta);
          this.logger.log(`Backup antiguo eliminado: ${backup.nombre}`);
        }
      }
    } catch (error) {
      this.logger.warn(`Error limpiando backups antiguos: ${(error as Error).message}`);
    }
  }

  private extraerPassword(url: string): string {
    const match = url.match(/:([^@]+)@/);
    return match ? match[1] : '';
  }

  private extraerConnectionString(url: string): string {
    // Eliminar el prefijo postgresql://
    return url.replace(/^postgresql:\/\//, '');
  }

  private extraerNombreBaseDatos(url: string): string {
    // Formato: postgresql://usuario:password@host:puerto/nombrebd
    const match = url.match(/\/([^/?]+)(?:[?]|$)/);
    return match ? match[1] : 'db_backup';
  }
}
