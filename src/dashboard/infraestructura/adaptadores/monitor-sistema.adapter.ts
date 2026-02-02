import * as os from 'node:os';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pm2 from 'pm2';

import type { EstadoBaseDatos, EstadoProcesoPM2, EstadoServicioExterno, EstadoWebSocket, RecursosHardware } from '@/dashboard/dominio/entidades/estado-sistema.entity';
import type { MonitorSistemaPuerto } from '@/dashboard/dominio/puertos/monitor-sistema.puerto';
import { PrismaService } from '@/prisma/prisma.service';
import { AlertasGateway } from '@/websockets/infraestructura/alertas.gateway';

@Injectable()
export class MonitorSistemaAdapter implements MonitorSistemaPuerto {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly alertasGateway: AlertasGateway,
    private readonly configService: ConfigService,
  ) {}

  async obtenerEstadoProcesosPM2(nombresProcesos: string[]): Promise<EstadoProcesoPM2[]> {
    return new Promise((resolve) => {
      pm2.connect((err) => {
        if (err) {
          resolve(
            nombresProcesos.map((nombre) => ({
              nombre,
              status: 'unknown' as const,
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

            return {
              nombre,
              status: estadoFinal,
            };
          });

          resolve(resultado);
        });
      });
    });
  }

  async verificarConexionBaseDatos(): Promise<EstadoBaseDatos> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return { db_status: 'connected' };
    } catch {
      return { db_status: 'error' };
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

    return {
      cpu_load: `${usage}%`,
      free_mem: this.formatearBytes(freeMem),
      total_mem: this.formatearBytes(totalMem),
      used_mem: this.formatearBytes(usedMem),
    };
  }

  async obtenerEstadoConexionesWebSocket(): Promise<EstadoWebSocket> {
    const supervisoresConectados = this.contarSupervisoresConectados();
    const servidorActivo = this.alertasGateway.servidor !== undefined && this.alertasGateway.servidor !== null;

    return {
      status: servidorActivo ? 'active' : 'inactive',
      supervisores_conectados: supervisoresConectados,
    };
  }

  private formatearBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)}GB`;
  }

  private contarSupervisoresConectados(): number {
    if (!this.alertasGateway.servidor) {
      return 0;
    }

    let totalConectados = 0;
    const rooms = this.alertasGateway.servidor.sockets.adapter.rooms;

    for (const [roomName] of rooms) {
      if (roomName.startsWith('supervisores-')) {
        const sala = this.alertasGateway.servidor.sockets.adapter.rooms.get(roomName);
        totalConectados += sala?.size ?? 0;
      }
    }

    return totalConectados;
  }

  async verificarServiciosExternos(): Promise<EstadoServicioExterno[]> {
    const servicios = [
      { nombre: 'Catálogos API', url: this.configService.get<string>('CATALOGOS_API_BASE') },
      { nombre: 'GeoServer', url: this.configService.get<string>('GEOSERVER_API_BASE') },
      { nombre: 'Jupiter API', url: this.configService.get<string>('JUPITER_API_BASE') },
      { nombre: 'Kerberos API', url: this.configService.get<string>('KERBEROS_API_BASE') },
      { nombre: 'WhatsApp API', url: this.configService.get<string>('WHATSAPP_API_BASE') },
      { nombre: 'Email API', url: this.configService.get<string>('EMAIL_API_BASE') },
      { nombre: 'Personal API', url: this.configService.get<string>('PERSONAL_API_BASE') },
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
