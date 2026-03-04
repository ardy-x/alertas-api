import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';

import { UbicacionPoint } from '@/integraciones/dominio/entidades/ubicacion.types';

import { PrismaService } from '@/prisma/prisma.service';
import { AtencionFuncionarioEntity } from '../../dominio/entidades/atencion-funcionario.entity';
import { RolAtencion } from '../../dominio/enums/atencion-enums';
import { AgregarFuncionarioDatos, AtencionPersonalPort } from '../../dominio/puertos/atencion-funcionario.port';

@Injectable()
export class AtencionFuncionarioPrismaAdapter implements AtencionPersonalPort {
  constructor(private readonly prisma: PrismaService) {}

  async marcarLlegada(idAtencion: string, ciFuncionario: string): Promise<void> {
    const fecha = new Date();
    await this.prisma.atencionFuncionario.updateMany({
      where: { idAtencion, ciFuncionario, fechaLlegada: null },
      data: { fechaLlegada: fecha },
    });
  }

  async confirmarLlegadaVictima(idAtencion: string, ciFuncionario: string): Promise<void> {
    await this.prisma.atencionFuncionario.updateMany({
      where: { idAtencion, ciFuncionario, confirmacionVictima: false },
      data: { confirmacionVictima: true },
    });
  }

  async agregarFuncionario(datos: AgregarFuncionarioDatos): Promise<void> {
    await this.prisma.atencionFuncionario.create({
      data: {
        id: datos.id,
        idAtencion: datos.idAtencion,
        rolAtencion: datos.rolAtencion,
        ubicacion: datos.ubicacion as unknown as Prisma.InputJsonValue,
        turnoInicio: new Date(datos.turnoInicio),
        turnoFin: new Date(datos.turnoFin),
        ciFuncionario: datos.ciFuncionario,
        unidad: datos.unidad || 'EXTERNA',
      },
    });
  }

  async obtenerPorAtencion(idAtencion: string): Promise<AtencionFuncionarioEntity[]> {
    const atencionesFuncionario = await this.prisma.atencionFuncionario.findMany({
      where: { idAtencion: idAtencion },
      orderBy: { creadoEn: 'asc' },
    });

    return atencionesFuncionario.map((af) => ({
      id: af.id,
      idAtencion: af.idAtencion,
      rolAtencion: af.rolAtencion as RolAtencion,
      ubicacion: af.ubicacion as unknown as UbicacionPoint | null,
      turnoInicio: af.turnoInicio.toISOString(),
      turnoFin: af.turnoFin.toISOString(),
      ciFuncionario: af.ciFuncionario || null,
      unidad: af.unidad || null,
      fechaLlegada: af.fechaLlegada ? af.fechaLlegada.toISOString() : null,
      confirmacionVictima: af.confirmacionVictima,
    }));
  }
}
