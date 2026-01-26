import { Injectable } from '@nestjs/common';

import { AlertaExtendida } from '@/alertas/dominio/entidades/alerta.entity';
import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

import { PrismaService } from '@/prisma/prisma.service';
import { AlertaActiva, AlertaHistorial, FiltrosAlerta, FiltrosAlertasActivas } from '../../dominio/entidades/alerta.entity';
import { AlertaWebRepositorioPort } from '../../dominio/puertos/alerta-web.port';

@Injectable()
export class AlertaWebPrismaAdapter implements AlertaWebRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerDetalleAlerta(id: string): Promise<AlertaExtendida | null> {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      include: {
        victima: {
          select: {
            id: true,
            cedulaIdentidad: true,
            nombreCompleto: true,
            celular: true,
            correo: true,
            fechaNacimiento: true,
            direccionDomicilio: true,
            puntoReferencia: true,
            contactosEmergencia: true,
          },
        },
        cierre: {
          include: {
            usuarioWeb: {
              select: {
                id: true,
                grado: true,
                nombreCompleto: true,
              },
            },
            cierreAlertaAgresores: true,
          },
        },
        atencion: {
          include: {
            atencionFuncionario: true,
          },
        },
        eventos: {
          include: {
            evidencias: true,
          },
        },
        rutaAlerta: true,
      },
    });

    if (!alerta) return null;

    const alertaEntity: AlertaExtendida = {
      id: alerta.id,
      idVictima: alerta.idVictima,
      idMunicipio: alerta.idMunicipio,
      fechaHora: alerta.fechaHora,
      codigoCud: alerta.codigoCud,
      codigoRegistro: alerta.codigoRegistro,
      estadoAlerta: alerta.estadoAlerta as EstadoAlerta,
      ubicacion: alerta.ubicacion as UbicacionPoint | null,
      origen: alerta.origen as OrigenAlerta,
    };

    return Object.assign(alertaEntity, {
      victima: alerta.victima,
      cierre: alerta.cierre,
      atencion: alerta.atencion,
      eventos: alerta.eventos,
      rutaAlerta: alerta.rutaAlerta,
    });
  }

  async listarAlertasActivas(filtros?: FiltrosAlertasActivas): Promise<AlertaActiva[]> {
    const where: Record<string, unknown> = {
      estadoAlerta: {
        in: [EstadoAlerta.PENDIENTE, EstadoAlerta.ASIGNADA, EstadoAlerta.EN_ATENCION],
      },
    };

    if (filtros?.municipiosIds && filtros.municipiosIds.length > 0) {
      where.idMunicipio = { in: filtros.municipiosIds };
    }

    const alertas = await this.prisma.alerta.findMany({
      where,
      include: {
        victima: true,
      },
      orderBy: { fechaHora: 'desc' },
    });

    return alertas.map((alerta) => ({
      id: alerta.id,
      idVictima: alerta.idVictima,
      estadoAlerta: alerta.estadoAlerta as EstadoAlerta,
      fechaHora: alerta.fechaHora,
      ubicacion: alerta.ubicacion as UbicacionPoint | null,
      idMunicipio: alerta.idMunicipio,
      origen: alerta.origen as OrigenAlerta,
      victima: alerta.victima
        ? {
            id: alerta.victima.id,
            nombreCompleto: alerta.victima.nombreCompleto,
            cedulaIdentidad: alerta.victima.cedulaIdentidad,
            celular: alerta.victima.celular,
          }
        : undefined,
      municipio: undefined,
    }));
  }

  async listarAlertaHistorial(filtros: FiltrosAlerta): Promise<{ alertas: AlertaHistorial[]; total: number }> {
    const where: Record<string, unknown> = {};

    // Si se especifican estados, filtrar entre ellos (deben ser finalizados)
    // Si no se especifican, mostrar todos los estados finalizados
    if (filtros.estadoAlerta && filtros.estadoAlerta.length > 0) {
      where.estadoAlerta = { in: filtros.estadoAlerta };
    } else {
      where.estadoAlerta = {
        in: [EstadoAlerta.RESUELTA, EstadoAlerta.CANCELADA, EstadoAlerta.FALSA_ALERTA],
      };
    }

    if (filtros.origen && filtros.origen.length > 0) {
      where.origen = { in: filtros.origen };
    }

    if (filtros.municipiosIds && filtros.municipiosIds.length > 0) {
      where.idMunicipio = { in: filtros.municipiosIds };
    } else if (filtros.idMunicipio) {
      where.idMunicipio = filtros.idMunicipio;
    }

    if (filtros.fechaDesde) {
      where.fechaHora = { gte: filtros.fechaDesde };
    }

    if (filtros.fechaHasta) {
      where.fechaHora = { ...(where.fechaHora as Record<string, unknown>), lte: filtros.fechaHasta };
    }

    if (filtros.busqueda) {
      where.victima = {
        OR: [{ nombreCompleto: { contains: filtros.busqueda, mode: 'insensitive' } }, { cedulaIdentidad: { contains: filtros.busqueda } }],
      };
    }

    // Configurar ordenamiento
    const campoOrden = filtros.ordenarPor || 'fechaHora';
    const direccionOrden = filtros.orden?.toLowerCase() || 'desc';

    const [alertas, total] = await Promise.all([
      this.prisma.alerta.findMany({
        where,
        include: {
          victima: {
            select: {
              cedulaIdentidad: true,
              nombreCompleto: true,
              celular: true,
            },
          },
        },
        orderBy: { [campoOrden]: direccionOrden },
        skip: filtros.pagina ? (filtros.pagina - 1) * (filtros.elementosPorPagina || 10) : 0,
        take: filtros.elementosPorPagina,
      }),
      this.prisma.alerta.count({ where }),
    ]);

    return {
      alertas: alertas.map((alerta) => ({
        id: alerta.id,
        idVictima: alerta.idVictima,
        estadoAlerta: alerta.estadoAlerta as EstadoAlerta,
        fechaHora: alerta.fechaHora,
        idMunicipio: alerta.idMunicipio,
        origen: alerta.origen as OrigenAlerta,
        codigoCud: alerta.codigoCud,
        codigoRegistro: alerta.codigoRegistro,
        victima: alerta.victima
          ? {
              cedulaIdentidad: alerta.victima.cedulaIdentidad,
              nombreCompleto: alerta.victima.nombreCompleto,
              celular: alerta.victima.celular,
            }
          : undefined,
      })),
      total,
    };
  }
}
