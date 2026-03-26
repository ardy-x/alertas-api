import { Injectable } from '@nestjs/common';

import { AlertaPorMunicipio, DatosMetricasGenerales } from '@/dashboard/dominio/entidades/dashboard.entity';
import { AlertaConFechaHora, AlertaParaMapa, DashboardRepositorioPort, EstadoAlertaCount } from '@/dashboard/dominio/puertos/dashboard.port';
import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardPrismaAdapter implements DashboardRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerMetricasGenerales(): Promise<DatosMetricasGenerales> {
    // Contar alertas por estado
    const alertasActivas = await this.prisma.alerta.count({
      where: {
        estadoAlerta: {
          in: ['ASIGNADA', 'EN_ATENCION'],
        },
      },
    });

    const alertasPendientes = await this.prisma.alerta.count({
      where: {
        estadoAlerta: 'PENDIENTE',
      },
    });

    const alertasResueltas = await this.prisma.alerta.count({
      where: {
        estadoAlerta: {
          in: ['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'],
        },
      },
    });

    // Obtener datos crudos de tiempos de asignación
    const tiemposAsignacion = await this.prisma.atencion.findMany({
      select: {
        creadoEn: true,
        alerta: {
          select: {
            creadoEn: true,
          },
        },
      },
    });

    // Obtener datos crudos de tiempos de cierre
    const tiemposCierre = await this.prisma.cierreAlerta.findMany({
      select: {
        creadoEn: true,
        alerta: {
          select: {
            creadoEn: true,
          },
        },
      },
    });

    // Obtener datos crudos de tiempos de registro
    const alertasConTiempoRegistro = await this.prisma.alerta.findMany({
      select: {
        fechaHora: true,
        creadoEn: true,
      },
      take: 1000, // Limitar para no sobrecargar
    });

    // Obtener datos crudos de tiempos de llegada física del policía
    const tiemposLlegadaBrutos = await this.prisma.atencionFuncionario.findMany({
      where: {
        fechaLlegada: {
          not: null,
        },
      },
      select: {
        fechaLlegada: true,
        atencion: {
          select: {
            alerta: {
              select: {
                creadoEn: true,
              },
            },
          },
        },
      },
    });

    // Filtrar y transformar para garantizar que fechaLlegada nunca sea null
    const tiemposLlegada = tiemposLlegadaBrutos
      .filter((t) => t.fechaLlegada !== null)
      .map((t) => ({
        fechaLlegada: t.fechaLlegada!,
        atencion: t.atencion,
      }));

    return {
      alertasActivas,
      alertasPendientes,
      alertasResueltas,
      tiemposAsignacion,
      tiemposCierre,
      alertasConTiempoRegistro,
      tiemposLlegada,
    };
  }

  async obtenerAlertasPorMunicipio(): Promise<AlertaPorMunicipio[]> {
    // Obtener todas las alertas con su municipio y estado en UNA sola consulta
    const alertas = await this.prisma.alerta.findMany({
      where: {
        idMunicipio: {
          not: null,
        },
      },
      select: {
        idMunicipio: true,
        estadoAlerta: true,
      },
    });

    // Agrupar en memoria (más eficiente que N+1 queries)
    const agrupacionPorMunicipio = new Map<number, { total: number; activas: number; cerradas: number }>();

    alertas.forEach((alerta) => {
      if (!alerta.idMunicipio) return;

      if (!agrupacionPorMunicipio.has(alerta.idMunicipio)) {
        agrupacionPorMunicipio.set(alerta.idMunicipio, { total: 0, activas: 0, cerradas: 0 });
      }

      const stats = agrupacionPorMunicipio.get(alerta.idMunicipio)!;
      stats.total += 1;

      if (['PENDIENTE', 'ASIGNADA', 'EN_ATENCION'].includes(alerta.estadoAlerta)) {
        stats.activas += 1;
      } else if (['RESUELTA', 'CANCELADA', 'FALSA_ALERTA'].includes(alerta.estadoAlerta)) {
        stats.cerradas += 1;
      }
    });

    // Convertir a array de resultados
    return Array.from(agrupacionPorMunicipio.entries()).map(([idMunicipio, stats]) => ({
      idMunicipio,
      totalAlertas: stats.total,
      alertasActivas: stats.activas,
      alertasCerradas: stats.cerradas,
    }));
  }

  async obtenerDistribucionEstados(): Promise<EstadoAlertaCount[]> {
    const distribucion = await this.prisma.alerta.groupBy({
      by: ['estadoAlerta'],
      _count: {
        id: true,
      },
    });

    return distribucion.map((item) => ({
      estado: item.estadoAlerta,
      cantidad: item._count.id,
    }));
  }

  async obtenerAlertasConFechaHora(): Promise<AlertaConFechaHora[]> {
    return await this.prisma.alerta.findMany({
      select: {
        fechaHora: true,
        idMunicipio: true,
      },
    });
  }

  async obtenerTodasLasAlertas(): Promise<AlertaParaMapa[]> {
    const alertas = await this.prisma.alerta.findMany({
      select: {
        id: true,
        estadoAlerta: true,
        idMunicipio: true,
        fechaHora: true,
        origen: true,
        ubicacion: true,
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return alertas.map((alerta) => ({
      id: alerta.id,
      estado: alerta.estadoAlerta,
      idMunicipio: alerta.idMunicipio,
      fechaHora: alerta.fechaHora,
      origen: alerta.origen,
      ubicacion: alerta.ubicacion as UbicacionPoint | null,
    }));
  }
}
