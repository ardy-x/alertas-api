import { exec } from 'node:child_process';
import * as os from 'node:os';
import { promisify } from 'node:util';
import { Injectable } from '@nestjs/common';
import * as pm2 from 'pm2';

import { SERVICIOS_CONFIG } from '@/config/servicios.config';
import type {
  EstadoBaseDatos,
  EstadoProcesoPM2,
  EstadoRedis,
  EstadoServicioExterno,
  EstadoWebSocket,
  OperadoresPorDepartamento,
  RecursosHardware,
} from '@/dashboard/dominio/entidades/estado-sistema.entity';
import type { MonitorSistemaPuerto } from '@/dashboard/dominio/puertos/monitor-sistema.puerto';
import { ObtenerDepartamentosUseCase } from '@/integraciones/aplicacion/casos-uso/obtener-departamentos.use-case';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { AlertasGateway } from '@/websockets/infraestructura/alertas.gateway';

@Injectable()
export class MonitorSistemaAdapter implements MonitorSistemaPuerto {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly alertasGateway: AlertasGateway,
    private readonly obtenerDepartamentosUseCase: ObtenerDepartamentosUseCase,
  ) {}

  async obtenerEstadoProcesosPM2(nombresProcesos: string[]): Promise<EstadoProcesoPM2[]> {
    return new Promise((resolve) => {
      pm2.connect((err) => {
        if (err) {
          resolve(
            nombresProcesos.map((nombre) => ({
              nombre,
              status: 'unknown' as const,
              uptime: 'N/A',
              restarts: 0,
              memory: 'N/A',
              cpu: 'N/A',
            })),
          );
          return;
        }

        pm2.list((err, lista) => {
          pm2.disconnect();

          if (err || !lista) {
            resolve(
              nombresProcesos.map((nombre) => ({
                nombre,
                status: 'unknown' as const,
                uptime: 'N/A',
                restarts: 0,
                memory: 'N/A',
                cpu: 'N/A',
              })),
            );
            return;
          }

          const resultado = nombresProcesos.map((nombre) => {
            const proceso = lista.find((p) => p.name === nombre);

            if (!proceso) {
              return {
                nombre,
                status: 'unknown' as const,
                uptime: 'N/A',
                restarts: 0,
                memory: 'N/A',
                cpu: 'N/A',
              };
            }

            const status = proceso.pm2_env?.status;
            let estadoFinal: 'online' | 'errored' | 'stopped' | 'unknown';

            if (status === 'online') {
              estadoFinal = 'online';
            } else if (status === 'errored') {
              estadoFinal = 'errored';
            } else if (status === 'stopped' || status === 'stopping') {
              estadoFinal = 'stopped';
            } else {
              estadoFinal = 'unknown';
            }

            // Calcular uptime
            const pmUptime = proceso.pm2_env?.pm_uptime;
            let uptime = 'N/A';
            if (pmUptime && estadoFinal === 'online') {
              const uptimeMs = Date.now() - pmUptime;
              uptime = this.formatearUptime(uptimeMs);
            }

            // Extraer memoria
            const memory = proceso.monit?.memory;
            const memoryFormatted = memory ? this.formatearBytes(memory) : 'N/A';

            // Extraer CPU
            const cpu = proceso.monit?.cpu;
            const cpuFormatted = cpu !== undefined ? `${cpu}%` : 'N/A';

            // Extraer reinicios
            const restarts = proceso.pm2_env?.restart_time ?? 0;

            return {
              nombre,
              status: estadoFinal,
              uptime,
              restarts,
              memory: memoryFormatted,
              cpu: cpuFormatted,
            };
          });

          resolve(resultado);
        });
      });
    });
  }

  async verificarConexionBaseDatos(): Promise<EstadoBaseDatos> {
    try {
      // Verificar conexión básica
      await this.prismaService.$queryRaw`SELECT 1`;

      // Obtener versión de PostgreSQL
      const versionResult = await this.prismaService.$queryRaw<Array<{ version: string }>>`SELECT version()`;
      const versionString = versionResult[0]?.version;
      const versionMatch = versionString?.match(/PostgreSQL ([\d.]+)/);
      const version = versionMatch ? `PostgreSQL ${versionMatch[1]}` : 'PostgreSQL';

      // Obtener configuración de conexiones máximas
      const maxConnResult = await this.prismaService.$queryRaw<Array<{ max_connections: string }>>`SHOW max_connections`;
      const maxConnections = maxConnResult[0]?.max_connections ? parseInt(maxConnResult[0].max_connections, 10) : 0;

      // Obtener número de conexiones activas
      const activeConnResult = await this.prismaService.$queryRaw<Array<{ count: bigint }>>`
        SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
      `;
      const activeConnections = activeConnResult[0]?.count ? Number(activeConnResult[0].count) : 0;

      return {
        db_status: 'connected',
        version,
        max_connections: maxConnections,
        active_connections: activeConnections,
      };
    } catch {
      return {
        db_status: 'error',
        version: 'N/A',
        max_connections: 0,
        active_connections: 0,
      };
    }
  }

  async verificarConexionRedis(): Promise<EstadoRedis> {
    try {
      // Verificar si Redis está conectado
      const isConnected = this.redisService.getConnectionStatus();

      if (!isConnected) {
        return {
          status: 'disconnected',
          uptime: 'N/A',
          used_memory: 'N/A',
          connected_clients: 0,
        };
      }

      // Obtener información de Redis usando el comando INFO
      const infoString = await this.redisService.getServerInfo('server');
      const statsString = await this.redisService.getServerInfo('stats');
      const memoryString = await this.redisService.getServerInfo('memory');

      if (!infoString || !statsString || !memoryString) {
        return {
          status: 'connected',
          uptime: 'N/A',
          used_memory: 'N/A',
          connected_clients: 0,
        };
      }

      // Parsear uptime
      const uptimeMatch = infoString.match(/uptime_in_seconds:(\d+)/);
      const uptimeSeconds = uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0;
      const uptime = uptimeSeconds ? this.formatearUptime(uptimeSeconds * 1000) : 'N/A';

      // Parsear memoria usada
      const memoryMatch = memoryString.match(/used_memory_human:([^\r\n]+)/);
      const usedMemory = memoryMatch ? memoryMatch[1].trim() : 'N/A';

      // Parsear clientes conectados
      const clientsMatch = statsString.match(/connected_clients:(\d+)/);
      const connectedClients = clientsMatch ? parseInt(clientsMatch[1], 10) : 0;

      return {
        status: 'connected',
        uptime,
        used_memory: usedMemory,
        connected_clients: connectedClients,
      };
    } catch {
      return {
        status: 'disconnected',
        uptime: 'N/A',
        used_memory: 'N/A',
        connected_clients: 0,
      };
    }
  }

  async obtenerRecursosHardware(): Promise<RecursosHardware> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - Math.floor((100 * idle) / total);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Obtener información de disco
    const diskInfo = await this.obtenerInfoDisco();

    return {
      cpu_load: `${usage}%`,
      free_mem: this.formatearBytes(freeMem),
      total_mem: this.formatearBytes(totalMem),
      used_mem: this.formatearBytes(usedMem),
      ...diskInfo,
    };
  }

  private async obtenerInfoDisco(): Promise<{
    disk_free?: string;
    disk_total?: string;
    disk_used?: string;
    disk_usage_percent?: string;
  }> {
    try {
      const execAsync = promisify(exec);
      // Usar df para obtener info de disco global (excluyendo tmpfs/devtmpfs)
      const { stdout } = await execAsync('df -k -x tmpfs -x devtmpfs');
      const lines = stdout.trim().split('\n');

      if (lines.length < 2) return {};

      let totalKB = 0;
      let usedKB = 0;
      let availableKB = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/);
        if (parts.length < 6) continue;

        // df output: Filesystem 1K-blocks Used Available Use% Mounted on
        const filesystem = parts[0] || '';
        const mountedOn = parts[5] || '';

        // Ignorar duplicados de mounts puntuales con overlay o bind en contenedores
        if (filesystem.startsWith('overlay') || mountedOn.startsWith('/proc') || mountedOn.startsWith('/sys') || mountedOn.startsWith('/dev')) {
          continue;
        }

        totalKB += parseInt(parts[1], 10) || 0;
        usedKB += parseInt(parts[2], 10) || 0;
        availableKB += parseInt(parts[3], 10) || 0;
      }

      const usagePercent = totalKB > 0 ? `${Math.round((usedKB * 100) / totalKB)}%` : '0%';

      return {
        disk_total: this.formatearBytes(totalKB * 1024),
        disk_used: this.formatearBytes(usedKB * 1024),
        disk_free: this.formatearBytes(availableKB * 1024),
        disk_usage_percent: usagePercent,
      };
    } catch {
      return {};
    }
  }

  async obtenerEstadoConexionesWebSocket(): Promise<EstadoWebSocket> {
    const porDepartamento = await this.obtenerOperadoresPorDepartamento();
    const operadoresConectados = porDepartamento.reduce((total, dept) => total + dept.operadores_conectados, 0);
    const servidorActivo = this.alertasGateway.servidor !== undefined && this.alertasGateway.servidor !== null;

    return {
      status: servidorActivo ? 'active' : 'inactive',
      operadores_conectados: operadoresConectados,
      por_departamento: porDepartamento,
    };
  }

  private formatearUptime(uptimeMs: number): string {
    const seconds = Math.floor(uptimeMs / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private formatearBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)}GB`;
  }

  private async obtenerOperadoresPorDepartamento(): Promise<OperadoresPorDepartamento[]> {
    if (!this.alertasGateway.servidor) {
      return [];
    }

    const departamentosMap = new Map<number, number>();
    const rooms = this.alertasGateway.servidor.sockets.adapter.rooms;

    for (const [roomName] of rooms) {
      if (roomName.startsWith('operadores-')) {
        const idDepartamento = parseInt(roomName.replace('operadores-', ''), 10);
        const sala = rooms.get(roomName);
        const cantidad = sala?.size ?? 0;

        if (cantidad > 0) {
          departamentosMap.set(idDepartamento, cantidad);
        }
      }
    }

    if (departamentosMap.size === 0) {
      return [];
    }

    const todosDepartamentos = await this.obtenerDepartamentosUseCase.ejecutar();

    return Array.from(departamentosMap.entries())
      .map(([idDept, cantidad]) => {
        const dept = todosDepartamentos.find((d) => d.id === idDept);
        return {
          departamento: dept?.departamento ?? `Departamento ${idDept}`,
          operadores_conectados: cantidad,
        };
      })
      .sort((a, b) => b.operadores_conectados - a.operadores_conectados);
  }

  async verificarServiciosExternos(): Promise<EstadoServicioExterno[]> {
    const servicios = [
      { nombre: 'Catálogos API', url: SERVICIOS_CONFIG.catalogosApiBase },
      { nombre: 'GeoServer', url: SERVICIOS_CONFIG.geoServerApiBase },
      { nombre: 'Jupiter API', url: SERVICIOS_CONFIG.jupiterApiBase },
      { nombre: 'Kerberos API', url: SERVICIOS_CONFIG.kerberosApiBase },
      { nombre: 'WhatsApp API', url: SERVICIOS_CONFIG.whatsappApiBase },
      { nombre: 'Email API', url: SERVICIOS_CONFIG.emailApiBase },
      { nombre: 'Personal API', url: SERVICIOS_CONFIG.personalApiBase },
    ];

    const verificaciones = servicios.map(async (servicio) => {
      if (!servicio.url) {
        return {
          nombre: servicio.nombre,
          url: 'No configurado',
          status: 'offline' as const,
        };
      }

      const inicio = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch(servicio.url, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const tiempoRespuesta = Date.now() - inicio;

        return {
          nombre: servicio.nombre,
          url: servicio.url,
          status: 'online' as const,
          tiempo_respuesta: tiempoRespuesta,
        };
      } catch {
        return {
          nombre: servicio.nombre,
          url: servicio.url,
          status: 'offline' as const,
        };
      }
    });

    return Promise.all(verificaciones);
  }
}
