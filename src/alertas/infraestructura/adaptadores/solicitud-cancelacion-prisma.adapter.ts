import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import {
  CrearSolicitudCancelacionDatos,
  FiltrosSolicitudCancelacion,
  ProcesarSolicitudCancelacionDatos,
  ResultadoBusquedaSolicitudCancelacionBasica,
  SolicitudCancelacionEntity,
} from '../../dominio/entidades/solicitud-cancelacion.entity';
import { EstadoSolicitudCancelacion } from '../../dominio/enums/alerta-enums';
import { SolicitudCancelacionRepositorioPort } from '../../dominio/puertos/solicitud-cancelacion.port';

@Injectable()
export class SolicitudCancelacionPrismaAdapter implements SolicitudCancelacionRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearSolicitud(datos: CrearSolicitudCancelacionDatos): Promise<void> {
    await this.prisma.solicitudCancelacion.create({
      data: {
        id: datos.id,
        idAlerta: datos.idAlerta,
        fechaSolicitud: datos.fechaSolicitud,
        estadoSolicitud: datos.estadoSolicitud,
      },
    });
  }

  async obtenerSolicitud(id: string): Promise<SolicitudCancelacionEntity | null> {
    const solicitud = await this.prisma.solicitudCancelacion.findUnique({
      where: { id },
      include: {
        alerta: {
          include: {
            victima: {
              select: {
                id: true,
                nombreCompleto: true,
                celular: true,
                cedulaIdentidad: true,
              },
            },
          },
        },
        usuarioWeb: {
          select: {
            id: true,
            nombreCompleto: true,
            grado: true,
          },
        },
      },
    });

    if (!solicitud) {
      return null;
    }

    return {
      id: solicitud.id,
      idAlerta: solicitud.idAlerta,
      fechaSolicitud: solicitud.fechaSolicitud,
      estadoSolicitud: solicitud.estadoSolicitud as EstadoSolicitudCancelacion,
      idUsuarioWeb: solicitud.idUsuarioWeb,
      motivoCancelacion: solicitud.motivoCancelacion,
      creadoEn: solicitud.creadoEn,
      actualizadoEn: solicitud.actualizadoEn,
      victima: {
        id: solicitud.alerta?.victima?.id || '',
        nombreCompleto: solicitud.alerta?.victima?.nombreCompleto || '',
        numeroCelular: solicitud.alerta?.victima?.celular || '',
        cedulaIdentidad: solicitud.alerta?.victima?.cedulaIdentidad || '',
      },
      usuarioWeb: {
        id: solicitud.usuarioWeb?.id || '',
        nombreCompleto: solicitud.usuarioWeb?.nombreCompleto || '',
        grado: solicitud.usuarioWeb?.grado || '',
      },
    };
  }

  async procesarSolicitud(id: string, datos: ProcesarSolicitudCancelacionDatos): Promise<void> {
    await this.prisma.solicitudCancelacion.update({
      where: { id },
      data: {
        estadoSolicitud: datos.estado,
        idUsuarioWeb: datos.idUsuarioWeb,
        motivoCancelacion: datos.motivoCancelacion,
      },
    });
  }

  async listarSolicitudes(filtros: FiltrosSolicitudCancelacion): Promise<ResultadoBusquedaSolicitudCancelacionBasica> {
    const where: Prisma.SolicitudCancelacionWhereInput = {};
    if (filtros) {
      if (filtros.estado && filtros.estado.length > 0) {
        where.estadoSolicitud = { in: filtros.estado };
      }
      if (filtros.idAlerta) {
        where.idAlerta = filtros.idAlerta;
      }
      if (filtros.fechaDesde || filtros.fechaHasta) {
        where.fechaSolicitud = {};
        if (filtros.fechaDesde) where.fechaSolicitud.gte = filtros.fechaDesde;
        if (filtros.fechaHasta) where.fechaSolicitud.lte = filtros.fechaHasta;
      }
      if (filtros.busqueda) {
        where.alerta = {
          victima: {
            OR: [
              {
                nombreCompleto: {
                  contains: filtros.busqueda,
                  mode: 'insensitive' as const,
                },
              },
              {
                cedulaIdentidad: {
                  contains: filtros.busqueda,
                  mode: 'insensitive' as const,
                },
              },
            ],
          },
        };
      }
      if (filtros.municipiosIds && filtros.municipiosIds.length > 0) {
        if (where.alerta) {
          where.alerta.idMunicipio = { in: filtros.municipiosIds };
        } else {
          where.alerta = {
            idMunicipio: { in: filtros.municipiosIds },
          };
        }
      }
    }

    const pagina = filtros.pagina ?? 1;
    const limite = filtros.elementosPorPagina ?? 10;
    const skip = (pagina - 1) * limite;

    // Configurar ordenamiento
    const campoOrden = filtros.ordenarPor || 'fechaSolicitud';
    const direccionOrden = filtros.orden?.toLowerCase() || 'desc';

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudCancelacion.findMany({
        where,
        include: {
          alerta: {
            include: {
              victima: {
                select: {
                  id: true,
                  nombreCompleto: true,
                  celular: true,
                  cedulaIdentidad: true,
                  correo: true,
                },
              },
            },
          },
        },
        orderBy: { [campoOrden]: direccionOrden },
        skip,
        take: limite,
      }),
      this.prisma.solicitudCancelacion.count({ where }),
    ]);

    const solicitudesBasicas = solicitudes.map((solicitud) => {
      const victima = solicitud.alerta?.victima;

      return {
        id: solicitud.id,
        idAlerta: solicitud.idAlerta,
        fechaSolicitud: solicitud.fechaSolicitud,
        estadoSolicitud: solicitud.estadoSolicitud as EstadoSolicitudCancelacion,
        victima: victima
          ? {
              id: victima.id,
              nombreCompleto: victima.nombreCompleto,
              cedulaIdentidad: victima.cedulaIdentidad,
              celular: victima.celular,
              correo: victima.correo || undefined,
            }
          : undefined,
      };
    });

    return {
      solicitudes: solicitudesBasicas,
      total,
    };
  }

  async verificarSolicitudPendiente(idAlerta: string): Promise<boolean> {
    const solicitud = await this.prisma.solicitudCancelacion.findFirst({
      where: {
        idAlerta,
        estadoSolicitud: EstadoSolicitudCancelacion.PENDIENTE,
      },
    });
    return !!solicitud;
  }
}
