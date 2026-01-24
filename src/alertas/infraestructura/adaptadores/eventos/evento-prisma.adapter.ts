import { Injectable } from '@nestjs/common';

import { Prisma, TipoEvento } from '@prisma/client';
import { CrearEventoDatos, EventoRepositorioPort } from '@/alertas/dominio/puertos/evento.port';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class EventoPrismaAdapter implements EventoRepositorioPort {
  constructor(private readonly prisma: PrismaService) {}

  async crearEvento(datos: CrearEventoDatos): Promise<void> {
    await this.prisma.evento.create({
      data: {
        id: datos.id,
        idAlerta: datos.idAlerta,
        idUsuarioWeb: datos.idUsuarioWeb,
        tipoEvento: datos.tipoEvento as TipoEvento,
        fechaHora: datos.fechaHora,
        ubicacion: datos.ubicacion as unknown as Prisma.InputJsonValue,
        ciFuncionario: datos.ciFuncionario,
      },
      include: {
        alerta: {
          include: {
            victima: true,
          },
        },
        evidencias: true,
      },
    });
  }
}
