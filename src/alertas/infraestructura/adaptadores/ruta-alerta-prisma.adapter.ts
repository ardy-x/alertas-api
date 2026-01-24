import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { RutaLineString } from '@/integraciones/dominio/entidades/ubicacion.types';

import { PrismaService } from '@/prisma/prisma.service';
import { ActualizarRutaAlertaDatos, CrearRutaAlertaDatos, RutaAlertaEntity } from '../../dominio/entidades/ruta-alerta.entity';
import { RutaAlertaRepositorioPort } from '../../dominio/puertos/ruta-alerta.port';

@Injectable()
export class RutaAlertaPrismaAdapter implements RutaAlertaRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearRutaAlerta(datos: CrearRutaAlertaDatos): Promise<RutaAlertaEntity> {
    const rutaAlerta = await this.prisma.rutaAlerta.create({
      data: {
        id: datos.id,
        idAlerta: datos.idAlerta,
        ruta: datos.ruta as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      id: rutaAlerta.id,
      idAlerta: rutaAlerta.idAlerta,
      ruta: rutaAlerta.ruta as unknown as RutaLineString,
      creadoEn: rutaAlerta.creadoEn,
      actualizadoEn: rutaAlerta.actualizadoEn || undefined,
    };
  }

  async obtenerPorIdAlerta(idAlerta: string): Promise<RutaAlertaEntity | null> {
    const rutaAlerta = await this.prisma.rutaAlerta.findUnique({
      where: { idAlerta },
    });

    if (!rutaAlerta) return null;

    return {
      id: rutaAlerta.id,
      idAlerta: rutaAlerta.idAlerta,
      ruta: rutaAlerta.ruta as unknown as RutaLineString,
      creadoEn: rutaAlerta.creadoEn,
      actualizadoEn: rutaAlerta.actualizadoEn || undefined,
    };
  }

  async actualizarPunto(idAlerta: string, datos: ActualizarRutaAlertaDatos): Promise<void> {
    await this.prisma.rutaAlerta.update({
      where: { idAlerta },
      data: {
        ruta: datos.ruta as unknown as Prisma.InputJsonValue,
      },
    });
  }
}
