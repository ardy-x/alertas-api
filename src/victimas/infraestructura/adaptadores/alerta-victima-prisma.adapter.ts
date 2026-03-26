import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';
import { HistorialAlertasVictima } from '../../dominio/entidades/alerta-victima.entity';
import { EstadoCuenta } from '../../dominio/enums/victima-enums';
import { AlertaVictimaRepositorioPort } from '../../dominio/puertos/alerta-victima.port';
import { FiltrosVictima, VictimaBase } from '../../dominio/puertos/victima.port';

@Injectable()
export class AlertaVictimaPrismaAdapter implements AlertaVictimaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerHistorialAlertas(idVictima: string): Promise<HistorialAlertasVictima | null> {
    // Obtener datos de la víctima
    const victima = await this.prisma.victima.findUnique({
      where: { id: idVictima },
      include: {
        contactosEmergencia: true,
      },
    });

    if (!victima) return null;

    // Obtener todas las alertas de la víctima con sus relaciones
    const alertas = await this.prisma.alerta.findMany({
      where: { idVictima },
      include: {
        atencion: {
          select: {
            creadoEn: true,
          },
        },
        cierre: {
          select: {
            creadoEn: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });

    // Retornar datos completos de la víctima
    return {
      victima: {
        id: victima.id,
        cedulaIdentidad: victima.cedulaIdentidad,
        nombreCompleto: victima.nombreCompleto,
        celular: victima.celular,
        fechaNacimiento: victima.fechaNacimiento,
        estadoCuenta: victima.estadoCuenta as EstadoCuenta,
        idMunicipio: victima.idMunicipio,
        correo: victima.correo || undefined,
        direccionDomicilio: victima.direccionDomicilio,
        puntoReferencia: victima.puntoReferencia,
        creadoEn: victima.creadoEn || undefined,
        contactosEmergencia: victima.contactosEmergencia,
      },
      alertas: alertas.map((alerta) => ({
        id: alerta.id,
        fechaHora: alerta.fechaHora,
        estadoAlerta: alerta.estadoAlerta,
        origen: alerta.origen,
        idMunicipio: alerta.idMunicipio,
        codigoCud: alerta.codigoCud,
        codigoRegistro: alerta.codigoRegistro,
        creadoEn: alerta.creadoEn,
        atencion: alerta.atencion,
        cierre: alerta.cierre,
      })),
    };
  }

  async suspenderCuenta(id: string): Promise<void> {
    await this.prisma.victima.update({
      where: { id },
      data: {
        apiKey: null,
        estadoCuenta: EstadoCuenta.SUSPENDIDA,
      },
    });
  }

  async listarVictimas(filtros: FiltrosVictima): Promise<{ victimas: VictimaBase[]; total: number }> {
    const where: Prisma.VictimaWhereInput = {};

    if (filtros.estadoCuenta && filtros.estadoCuenta.length > 0) {
      where.estadoCuenta = { in: filtros.estadoCuenta };
    }
    if (filtros.municipiosIds && filtros.municipiosIds.length > 0) {
      where.idMunicipio = { in: filtros.municipiosIds };
    }
    if (filtros.victimasIds && filtros.victimasIds.length > 0) {
      where.id = { in: filtros.victimasIds };
    }

    // Búsqueda por texto en campos relevantes
    if (filtros.busqueda && filtros.busqueda.trim() !== '') {
      const q = filtros.busqueda.trim();
      where.OR = [
        { nombreCompleto: { contains: q, mode: 'insensitive' } },
        { cedulaIdentidad: { contains: q, mode: 'insensitive' } },
        { correo: { contains: q, mode: 'insensitive' } },
        { celular: { contains: q, mode: 'insensitive' } },
      ];
    }

    const pagina = filtros.pagina && filtros.pagina > 0 ? filtros.pagina : 1;
    const limite = filtros.elementosPorPagina && filtros.elementosPorPagina > 0 ? Math.min(filtros.elementosPorPagina, 100) : 10;
    const skip = (pagina - 1) * limite;

    // Configurar ordenamiento
    const campoOrden = filtros.ordenarPor || 'creadoEn';
    const direccionOrden = filtros.orden?.toLowerCase() || 'desc';

    const [rows, total] = await Promise.all([
      this.prisma.victima.findMany({
        where,
        select: {
          id: true,
          cedulaIdentidad: true,
          nombreCompleto: true,
          celular: true,
          estadoCuenta: true,
          idMunicipio: true,
          fechaNacimiento: true,
          correo: true,
          creadoEn: true,
          actualizadoEn: true,
          ultimaConexion: true,
          permisosApp: true,
        },
        orderBy: { [campoOrden]: direccionOrden },
        skip,
        take: limite,
      }),
      this.prisma.victima.count({ where }),
    ]);

    const victimas: VictimaBase[] = rows.map((victima) => {
      let permisosAppParsed: { ubicacion: boolean; notificaciones: boolean } | undefined;

      if (victima.permisosApp) {
        if (typeof victima.permisosApp === 'string') {
          permisosAppParsed = JSON.parse(victima.permisosApp);
        } else if (typeof victima.permisosApp === 'object') {
          permisosAppParsed = victima.permisosApp as { ubicacion: boolean; notificaciones: boolean };
        }
      }

      return {
        id: victima.id,
        cedulaIdentidad: victima.cedulaIdentidad,
        nombreCompleto: victima.nombreCompleto,
        celular: victima.celular,
        estadoCuenta: victima.estadoCuenta as EstadoCuenta,
        idMunicipio: victima.idMunicipio,
        fechaNacimiento: victima.fechaNacimiento,
        correo: victima.correo || undefined,
        creadoEn: victima.creadoEn || undefined,
        actualizadoEn: victima.actualizadoEn || undefined,
        ultimaConexion: victima.ultimaConexion || undefined,
        permisosApp: permisosAppParsed || undefined,
      };
    });

    return {
      victimas,
      total,
    };
  }
}
