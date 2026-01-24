import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { EstadoAlerta, OrigenAlerta } from '@/alertas/dominio/enums/alerta-enums';
import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

import { PrismaService } from '@/prisma/prisma.service';
import { AlertaBase, AlertaCreada, NuevaAlerta } from '../../dominio/entidades/alerta.entity';
import { AlertaRepositorioPort } from '../../dominio/puertos/alerta.port';

@Injectable()
export class AlertaPrismaAdapter implements AlertaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearAlerta(datos: NuevaAlerta): Promise<AlertaCreada> {
    const alertaCreada = await this.prisma.alerta.create({
      data: {
        id: datos.id,
        idVictima: datos.idVictima,
        idMunicipio: datos.idMunicipio ?? null,
        fechaHora: datos.fechaHora,
        codigoCud: datos.codigoCud ?? null,
        codigoRegistro: datos.codigoRegistro ?? null,
        estadoAlerta: datos.estadoAlerta || EstadoAlerta.PENDIENTE,
        ubicacion: datos.ubicacion as unknown as Prisma.InputJsonValue,
        origen: datos.origen || OrigenAlerta.FELCV,
      },
    });

    return {
      id: alertaCreada.id,
      estadoAlerta: alertaCreada.estadoAlerta as EstadoAlerta,
    };
  }

  async obtenerAlertaSimple(id: string): Promise<AlertaBase | null> {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      select: {
        id: true,
        idVictima: true,
        estadoAlerta: true,
        idMunicipio: true,
        fechaHora: true,
        ubicacion: true,
        origen: true,
      },
    });

    if (!alerta) return null;

    return {
      id: alerta.id,
      idVictima: alerta.idVictima,
      idMunicipio: alerta.idMunicipio,
      estadoAlerta: alerta.estadoAlerta as EstadoAlerta,
      fechaHora: alerta.fechaHora,
      ubicacion: alerta.ubicacion as UbicacionPoint | null,
      origen: alerta.origen as OrigenAlerta,
    };
  }

  async obtenerEstadoAlerta(id: string): Promise<EstadoAlerta | null> {
    const alerta = await this.prisma.alerta.findUnique({
      where: { id },
      select: {
        estadoAlerta: true,
      },
    });

    if (!alerta) return null;

    return alerta.estadoAlerta as EstadoAlerta;
  }

  async actualizarEstado(id: string, estadoAlerta: EstadoAlerta): Promise<void> {
    await this.prisma.alerta.update({
      where: { id },
      data: { estadoAlerta: estadoAlerta },
    });
  }

  async actualizarUbicacion(id: string, ubicacion: UbicacionPoint | null): Promise<void> {
    await this.prisma.alerta.update({
      where: { id },
      data: { ubicacion: ubicacion as unknown as Prisma.InputJsonValue },
    });
  }

  async verificarVictimaExiste(idVictima: string): Promise<boolean> {
    const victima = await this.prisma.victima.findUnique({
      where: { id: idVictima },
    });
    return !!victima;
  }

  async verificarAlertaActivaVictima(idVictima: string): Promise<boolean> {
    const alertaActiva = await this.prisma.alerta.findFirst({
      where: {
        idVictima: idVictima,
        estadoAlerta: {
          in: [EstadoAlerta.PENDIENTE, EstadoAlerta.ASIGNADA, EstadoAlerta.EN_ATENCION],
        },
      },
    });
    return !!alertaActiva;
  }

  async obtenerDatosVictimaParaAlerta(idVictima: string): Promise<{ nombreCompleto: string; idMunicipio: number | null }> {
    const victima = await this.prisma.victima.findUnique({
      where: { id: idVictima },
      select: {
        nombreCompleto: true,
        idMunicipio: true,
      },
    });

    if (!victima) {
      throw new Error(`Víctima con ID ${idVictima} no encontrada`);
    }

    return {
      nombreCompleto: victima.nombreCompleto,
      idMunicipio: victima.idMunicipio,
    };
  }
}
